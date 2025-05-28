import * as cheerio from 'cheerio';

interface ScoreSearchResult {
  id: string;
  title: string;
  composer: string;
  url: string;
  details: {
    key?: string;
    timeSignature?: string;
    tempo?: string;
    instruments?: string[];
  };
}

function calculateTitleSimilarity(a: string, b: string): number {
  const normalize = (str: string) => str.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const titleA = normalize(a);
  const titleB = normalize(b);

  if (titleA === titleB) return 1;
  if (titleA.includes(titleB) || titleB.includes(titleA)) return 0.9;

  const wordsA = titleA.split(' ');
  const wordsB = titleB.split(' ');
  const commonWords = wordsA.filter(word => wordsB.includes(word));

  return commonWords.length / Math.max(wordsA.length, wordsB.length);
}

function calculateComposerSimilarity(a: string, b: string): number {
  const normalize = (str: string) => str.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const composerA = normalize(a);
  const composerB = normalize(b);

  if (composerA === composerB) return 1;

  // Handle name variations (e.g., "J.S. Bach" vs "Johann Sebastian Bach")
  const initialsA = composerA.match(/\b(\w)\.?/g)?.join('') || '';
  const initialsB = composerB.match(/\b(\w)\.?/g)?.join('') || '';
  if (initialsA && initialsB && initialsA === initialsB) return 0.9;

  const namesA = composerA.split(' ');
  const namesB = composerB.split(' ');
  const commonNames = namesA.filter(name => namesB.includes(name));

  return commonNames.length / Math.max(namesA.length, namesB.length);
}

// Helper function to delay execution with exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to perform fetch with retry logic and proper error handling
async function fetchWithRetry(url: string, retries = 3, initialDelayMs = 1000): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      console.warn(`Attempt ${attempt}/${retries} failed:`, lastError.message);
      
      // Log detailed error information for debugging
      console.error('Detailed error information:', {
        attempt,
        url,
        error: lastError.message,
        timestamp: new Date().toISOString()
      });
      
      if (attempt < retries) {
        // Exponential backoff with jitter
        const backoffDelay = initialDelayMs * Math.pow(2, attempt - 1) * (0.5 + Math.random());
        console.log(`Retrying in ${Math.round(backoffDelay)}ms...`);
        await delay(backoffDelay);
        continue;
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch after multiple retries');
}

export async function searchFlatScore(title: string, composer: string): Promise<ScoreSearchResult | null> {
  try {
    if (!title || !composer) {
      console.warn('Missing required search parameters:', { title, composer });
      return null;
    }

    const searchQuery = encodeURIComponent(`${title} ${composer}`);
    const url = `https://flat.io/discover/scores?q=${searchQuery}`;
    
    console.log('Searching Flat.io for:', { title, composer, url });
    
    const response = await fetchWithRetry(url);
    const html = await response.text();
    
    // Validate HTML response
    if (!html || html.trim().length === 0) {
      console.error('Received empty response from Flat.io');
      return null;
    }
    
    const $ = cheerio.load(html);
    
    let bestMatch: ScoreSearchResult | null = null;
    let bestMatchScore = 0;

    // Examine all score cards to find the best match
    $('.score-card').each((_, element) => {
      const scoreCard = $(element);
      const scoreId = scoreCard.attr('data-score-id');
      const scoreTitle = scoreCard.find('.score-title').text().trim();
      const scoreComposer = scoreCard.find('.score-composer').text().trim();
      const scoreUrl = scoreCard.find('a').attr('href');

      if (!scoreId || !scoreUrl) {
        console.debug('Skipping invalid score card:', { scoreId, scoreUrl });
        return;
      }

      // Calculate match score based on title and composer similarity
      const titleSimilarity = calculateTitleSimilarity(scoreTitle, title);
      const composerSimilarity = calculateComposerSimilarity(scoreComposer, composer);
      const matchScore = (titleSimilarity * 0.6) + (composerSimilarity * 0.4);

      // Extract musical details
      const details = {
        key: scoreCard.find('.score-key').text().trim() || undefined,
        timeSignature: scoreCard.find('.score-time-signature').text().trim() || undefined,
        tempo: scoreCard.find('.score-tempo').text().trim() || undefined,
        instruments: scoreCard.find('.score-instruments').text().trim()
          .split(',')
          .map(i => i.trim())
          .filter(Boolean)
      };

      if (matchScore > bestMatchScore) {
        bestMatchScore = matchScore;
        bestMatch = {
          id: scoreId,
          title: scoreTitle,
          composer: scoreComposer,
          url: `https://flat.io${scoreUrl}`,
          details
        };
      }
    });

    // Only return matches that exceed a minimum similarity threshold
    if (bestMatchScore > 0.7) {
      console.log('Found matching score:', bestMatch);
      return bestMatch;
    }
    
    console.log('No matching score found above threshold');
    return null;

  } catch (error) {
    // Enhanced error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error searching Flat.io:', {
      error: errorMessage,
      title,
      composer,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return null instead of throwing to prevent the entire activity generation from failing
    return null;
  }
}