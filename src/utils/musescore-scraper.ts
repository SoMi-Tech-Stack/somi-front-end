import { parse } from 'node-html-parser';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface MuseScoreResult {
  title: string;
  composer: string;
  musicXmlUrl?: string;
  details: {
    key?: string;
    timeSignature?: string;
    yearComposed?: string;
    about?: string;
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

async function fetchWithRetry(url: string, retries = 3, initialDelayMs = 1000): Promise<Response> {
  let lastError: Error | null = null;
  let currentDelay = initialDelayMs;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (compatible; ClassroomMusicBot/1.0)',
          'Referer': 'https://musescore.com'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Attempt ${attempt}/${retries} failed for URL ${url}:`, lastError.message);
      
      if (attempt < retries) {
        await delay(currentDelay);
        currentDelay *= 2; // Exponential backoff
        continue;
      }
    }
  }
  
  throw new Error(`Failed to fetch ${url} after ${retries} attempts. Last error: ${lastError?.message}`);
}

async function validatePageStructure(root: any): Promise<boolean> {
  try {
    const scoreCards = root.querySelectorAll('.score-card');
    if (!scoreCards || scoreCards.length === 0) {
      console.warn('No score cards found on page - possible structure change');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error validating page structure:', error);
    return false;
  }
}

export async function searchMuseScore(title: string, composer: string): Promise<MuseScoreResult | null> {
  try {
    // First check if we already have the score in our database
    const { data: existingScore, error: queryError } = await supabase
      .from('scores')
      .select('*')
      .eq('title', title)
      .eq('composer', composer)
      .eq('source', 'musescore')
      .maybeSingle();

    if (queryError) {
      console.error('Error querying database:', queryError);
    } else if (existingScore) {
      console.log('Found existing score in database:', existingScore);
      return {
        title: existingScore.title,
        composer: existingScore.composer,
        musicXmlUrl: existingScore.music_xml,
        details: existingScore.metadata
      };
    }

    const searchQuery = encodeURIComponent(`${title} ${composer}`);
    const searchUrl = `https://musescore.com/sheetmusic?text=${searchQuery}`;

    console.log('Searching MuseScore for:', { title, composer, url: searchUrl });

    let response;
    try {
      response = await fetchWithRetry(searchUrl);
    } catch (error) {
      console.error('Failed to fetch MuseScore search page:', error);
      return null; // Return null instead of throwing to allow fallback to IMSLP
    }

    const html = await response.text();
    const root = parse(html);

    // Validate page structure
    if (!await validatePageStructure(root)) {
      console.warn('Invalid page structure detected - skipping MuseScore search');
      return null;
    }

    let bestMatch: MuseScoreResult | null = null;
    let bestMatchScore = 0;

    // Search through the score cards
    const scoreCards = root.querySelectorAll('.score-card');
    
    for (const card of scoreCards) {
      try {
        const scoreTitle = card.querySelector('.score-title')?.text?.trim() || '';
        const scoreComposer = card.querySelector('.score-composer')?.text?.trim() || '';
        const scoreUrl = card.querySelector('a')?.getAttribute('href');

        if (!scoreUrl || !scoreTitle || !scoreComposer) {
          console.warn('Incomplete score card data, skipping:', { scoreUrl, scoreTitle, scoreComposer });
          continue;
        }

        const titleSimilarity = calculateSimilarity(scoreTitle, title);
        const composerSimilarity = calculateSimilarity(scoreComposer, composer);
        const matchScore = (titleSimilarity * 0.6) + (composerSimilarity * 0.4);

        if (matchScore > bestMatchScore) {
          try {
            // Fetch the score page to get the MusicXML download URL
            console.log('Fetching score details:', scoreUrl);
            const scorePageResponse = await fetchWithRetry(`https://musescore.com${scoreUrl}`);
            const scorePage = await scorePageResponse.text();
            const scoreRoot = parse(scorePage);

            // Get the MusicXML content
            const musicXmlUrl = scoreRoot.querySelector('.download-xml')?.getAttribute('href');
            
            if (!musicXmlUrl) {
              console.warn('No MusicXML URL found for score:', scoreUrl);
              continue;
            }

            let musicXmlContent;
            try {
              const xmlResponse = await fetchWithRetry(musicXmlUrl);
              musicXmlContent = await xmlResponse.text();
            } catch (error) {
              console.error('Failed to fetch MusicXML content:', error);
              continue;
            }

            // Extract metadata safely
            const metadata = {
              key: scoreRoot.querySelector('.key-signature')?.text?.trim(),
              timeSignature: scoreRoot.querySelector('.time-signature')?.text?.trim(),
              yearComposed: scoreRoot.querySelector('.composition-year')?.text?.trim(),
              about: scoreRoot.querySelector('.score-description')?.text?.trim()
            };
            
            try {
              const { error: insertError } = await supabase
                .from('scores')
                .insert({
                  title: scoreTitle,
                  composer: scoreComposer,
                  music_xml: musicXmlContent,
                  source: 'musescore',
                  metadata
                });
                
              if (insertError) {
                console.error('Error storing score:', insertError);
              } else {
                console.log('Successfully stored score in database');
              }
            } catch (error) {
              console.error('Failed to store score in database:', error);
              // Continue even if database storage fails
            }
            
            bestMatchScore = matchScore;
            bestMatch = {
              title: scoreTitle,
              composer: scoreComposer,
              musicXmlUrl: musicXmlContent,
              details: metadata
            };
          } catch (error) {
            console.error('Error fetching score details:', error);
            continue;
          }
        }
      } catch (error) {
        console.error('Error processing score card:', error);
        continue;
      }
    }

    if (bestMatchScore > 0.7) {
      console.log('Found matching score:', bestMatch);
      return bestMatch;
    }

    console.log('No matching score found above threshold');
    return null;

  } catch (error) {
    console.error('Error searching MuseScore:', error);
    return null; // Return null instead of throwing to allow fallback to IMSLP
  }
}