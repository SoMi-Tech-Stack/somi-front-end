import { parse } from 'node-html-parser';

interface FMATrack {
  title: string;
  composer: string;
  audioUrl: string;
  details: {
    duration?: string;
    license?: string;
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

// Circuit breaker state
let lastFailureTime = 0;
const CIRCUIT_BREAKER_TIMEOUT = 30 * 1000; // Reduced to 30 seconds for faster recovery
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 2;

async function fetchWithRetry(url: string, retries = 3): Promise<Response | null> {
  // Check circuit breaker
  if (Date.now() - lastFailureTime < CIRCUIT_BREAKER_TIMEOUT && consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    console.warn(`Circuit breaker active. Service temporarily unavailable due to ${consecutiveFailures} consecutive failures. Will retry after ${Math.ceil((CIRCUIT_BREAKER_TIMEOUT - (Date.now() - lastFailureTime)) / 1000)}s`);
    return null;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempting to fetch ${url} (attempt ${attempt}/${retries})`);
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }).finally(() => clearTimeout(timeout));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Reset circuit breaker on successful request
      consecutiveFailures = 0;
      lastFailureTime = 0;
      return response;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < retries) {
        const delayTime = 1000 * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`Retrying in ${delayTime}ms...`);
        await delay(delayTime);
        continue;
      }
    }
  }
  
  // Update circuit breaker state
  consecutiveFailures++;
  lastFailureTime = Date.now();
  console.warn(`Failed to fetch after ${retries} retries. Circuit breaker status: ${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES} failures.`);
  return null;
}

export async function searchFMATrack(title: string, composer: string): Promise<FMATrack | null> {
  try {
    if (!title || !composer) {
      console.log('Missing required search parameters');
      return null;
    }

    console.log(`Searching FMA for title: "${title}" composer: "${composer}"`);
    
    const searchQuery = encodeURIComponent(`${title} ${composer}`);
    const searchUrl = `https://freemusicarchive.org/search/?quicksearch=${searchQuery}`;
    
    const response = await fetchWithRetry(searchUrl);
    if (!response) {
      console.log('Failed to fetch from FMA - service may be temporarily unavailable');
      return null;
    }

    const html = await response.text();
    
    if (!html) {
      console.log('Empty response received from FMA');
      return null;
    }

    if (!html.includes('play-item')) {
      console.log('No track elements found in the response HTML');
      return null;
    }
    
    const root = parse(html);
    
    let bestMatch: FMATrack | null = null;
    let bestMatchScore = 0;

    const trackElements = root.querySelectorAll('.play-item, .track-item, .music-item');
    
    console.log(`Found ${trackElements.length} potential track elements`);
    
    for (const element of trackElements) {
      try {
        const trackTitle = element.querySelector('.track-title, .title')?.text?.trim() || '';
        const trackComposer = element.querySelector('.track-artist, .artist')?.text?.trim() || '';
        const audioUrl = element.querySelector('a[data-url], .play-button[data-url], audio source')?.getAttribute('data-url') || 
                        element.querySelector('audio')?.getAttribute('src');

        if (!trackTitle || !trackComposer || !audioUrl) {
          console.log('Skipping track element - missing required data');
          continue;
        }

        console.log(`Processing track: "${trackTitle}" by "${trackComposer}"`);

        const titleSimilarity = calculateSimilarity(trackTitle, title);
        const composerSimilarity = calculateSimilarity(trackComposer, composer);
        const matchScore = (titleSimilarity * 0.6) + (composerSimilarity * 0.4);

        console.log(`Match score: ${matchScore} (title: ${titleSimilarity}, composer: ${composerSimilarity})`);

        if (matchScore > bestMatchScore && matchScore > 0.7) {
          bestMatch = {
            title: trackTitle,
            composer: trackComposer,
            audioUrl,
            details: {
              duration: element.querySelector('.track-duration, .duration')?.text?.trim(),
              license: element.querySelector('.track-license, .license')?.text?.trim(),
              about: element.querySelector('.track-description, .description')?.text?.trim()
            }
          };
          bestMatchScore = matchScore;
          console.log('New best match found:', bestMatch);
        }
      } catch (error) {
        console.error('Error processing track element:', error);
        continue;
      }
    }

    return bestMatch;
  } catch (error) {
    console.error('Error searching Free Music Archive:', error);
    return null;
  }
}