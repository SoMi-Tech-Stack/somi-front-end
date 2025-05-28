import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface ScoreDetails {
  musicXmlUrl?: string;
  pdfUrl?: string;
  title: string;
  composer: string;
  details: {
    key?: string;
    timeSignature?: string;
    yearComposed?: string;
  };
}

function calculateSimilarity(a: string, b: string): number {
  const normalize = (str: string) => str.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const strA = normalize(a);
  const strB = normalize(b);

  if (strA === strB) return 1;
  if (strA.includes(strB) || strB.includes(strA)) return 0.9;

  const wordsA = strA.split(' ');
  const wordsB = strB.split(' ');
  const commonWords = wordsA.filter(word => wordsB.includes(word));

  return commonWords.length / Math.max(wordsA.length, wordsB.length);
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Circuit breaker state
let failureCount = 0;
const FAILURE_THRESHOLD = 5;
const RESET_TIMEOUT = 300000; // 5 minutes
let circuitBreakerTimer: NodeJS.Timeout | null = null;

async function fetchWithRetry(url: string, retries = 3, initialDelayMs = 1000): Promise<Response> {
  // Check circuit breaker
  if (failureCount >= FAILURE_THRESHOLD) {
    throw new Error('Circuit breaker is open. Too many failed requests to IMSLP.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (compatible; ClassroomMusicBot/1.0)',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Don't retry on 4xx errors
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status} ${response.statusText}`);
      }

      // Retry on 5xx errors
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reset failure count on successful request
      failureCount = 0;
      if (circuitBreakerTimer) {
        clearTimeout(circuitBreakerTimer);
        circuitBreakerTimer = null;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Attempt ${attempt}/${retries} failed for URL ${url}:`, lastError.message);

      // Increment failure count
      failureCount++;

      // Start reset timer if not already running
      if (!circuitBreakerTimer) {
        circuitBreakerTimer = setTimeout(() => {
          failureCount = 0;
          circuitBreakerTimer = null;
        }, RESET_TIMEOUT);
      }
      
      if (attempt < retries) {
        // Exponential backoff with jitter
        const jitter = Math.random() * 1000;
        const backoffDelay = initialDelayMs * Math.pow(2, attempt - 1) + jitter;
        await delay(backoffDelay);
        continue;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }
  
  throw new Error(`Failed to fetch ${url} after ${retries} attempts. Last error: ${lastError?.message}`);
}

export async function searchIMSLPScore(title: string, composer: string): Promise<ScoreDetails | null> {
  try {
    // First check if we already have the score in our database
    const { data: existingScore, error: queryError } = await supabase
      .from('scores')
      .select('*')
      .eq('title', title)
      .eq('composer', composer)
      .eq('source', 'imslp')
      .maybeSingle();

    if (queryError) {
      console.error('Error querying database:', queryError);
      // Continue with IMSLP search even if database query fails
    } else if (existingScore) {
      console.log('Found existing score in database:', existingScore);
      return {
        title: existingScore.title,
        composer: existingScore.composer,
        musicXmlUrl: existingScore.music_xml,
        pdfUrl: existingScore.metadata.pdfUrl,
        details: existingScore.metadata
      };
    }

    const searchQuery = encodeURIComponent(`${title} ${composer}`);
    const searchUrl = `https://imslp.org/wiki/Special:Search?search=${searchQuery}`;
    
    console.log('Searching IMSLP:', searchUrl);
    const response = await fetchWithRetry(searchUrl);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    let bestMatch: ScoreDetails | null = null;
    let bestMatchScore = 0;

    // Search through search results
    $('.mw-search-result').each((_, element) => {
      const resultTitle = $(element).find('.mw-search-result-heading a').text().trim();
      const resultComposer = $(element).find('.mw-search-result-data').text().trim();
      
      const titleSimilarity = calculateSimilarity(resultTitle, title);
      const composerSimilarity = calculateSimilarity(resultComposer, composer);
      const matchScore = (titleSimilarity * 0.6) + (composerSimilarity * 0.4);

      if (matchScore > bestMatchScore) {
        const scoreUrl = 'https://imslp.org' + $(element).find('a').attr('href');
        
        bestMatchScore = matchScore;
        bestMatch = {
          title: resultTitle,
          composer: resultComposer,
          pdfUrl: scoreUrl,
          details: {
            yearComposed: $(element).find('.published-year').text().trim() || undefined
          }
        };
      }
    });

    if (bestMatchScore > 0.7 && bestMatch) {
      try {
        // Fetch the score page to get more details
        console.log('Fetching score details:', bestMatch.pdfUrl);
        const scoreResponse = await fetchWithRetry(bestMatch.pdfUrl!);
        const scorePage = await scoreResponse.text();
        const $score = cheerio.load(scorePage);

        // Look for MusicXML files
        $score('.we_file_download').each((_, element) => {
          const fileLink = $score(element).attr('href');
          if (fileLink?.toLowerCase().includes('.xml') && bestMatch) {
            // Download and store the MusicXML content
            console.log('Found MusicXML file:', fileLink);
            fetchWithRetry(fileLink)
              .then(response => response.text())
              .then(async xmlContent => {
                const { error: insertError } = await supabase
                  .from('scores')
                  .insert({
                    title: bestMatch.title,
                    composer: bestMatch.composer,
                    music_xml: xmlContent,
                    source: 'imslp',
                    metadata: {
                      ...bestMatch.details,
                      pdfUrl: bestMatch.pdfUrl
                    }
                  });
                  
                if (insertError) {
                  console.error('Error storing score:', insertError);
                } else {
                  console.log('Successfully stored score in database');
                }
                
                bestMatch.musicXmlUrl = xmlContent;
              })
              .catch(error => {
                console.error('Error downloading MusicXML:', error);
              });
          }
        });

        // Extract additional metadata
        bestMatch.details = {
          ...bestMatch.details,
          key: $score('.key_signature').text().trim() || undefined,
          timeSignature: $score('.time_signature').text().trim() || undefined
        };

        return bestMatch;
      } catch (error) {
        console.error('Error fetching score details:', error);
        // Return the basic match info even if detailed fetch fails
        return bestMatch;
      }
    }

    console.log('No matching score found on IMSLP');
    return null;
  } catch (error) {
    console.error('Error searching IMSLP:', error);
    throw new Error(`IMSLP search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}