import { parse } from 'node-html-parser';
import { createClient } from '@supabase/supabase-js';
import type { ScoreDetails } from './types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const OPENSCORE_BASE_URL = 'https://openscore.cc';

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (compatible; ClassroomMusicBot/1.0)'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch after multiple retries');
}

export async function searchOpenScore(title: string, composer: string): Promise<ScoreDetails | null> {
  try {
    // Check database first
    const { data: existingScore } = await supabase
      .from('scores')
      .select('*')
      .eq('title', title)
      .eq('composer', composer)
      .eq('source', 'openscore')
      .maybeSingle();

    if (existingScore) {
      return {
        title: existingScore.title,
        composer: existingScore.composer,
        musicXmlUrl: existingScore.music_xml,
        details: existingScore.metadata
      };
    }

    const searchQuery = encodeURIComponent(`${title} ${composer}`);
    const searchUrl = `${OPENSCORE_BASE_URL}/search?q=${searchQuery}`;
    
    const response = await fetchWithRetry(searchUrl);
    const html = await response.text();
    const root = parse(html);
    
    // Find the best matching score
    const scoreElements = root.querySelectorAll('.score-item');
    let bestMatch: ScoreDetails | null = null;
    let bestMatchScore = 0;

    for (const element of scoreElements) {
      const scoreTitle = element.querySelector('.score-title')?.text?.trim() || '';
      const scoreComposer = element.querySelector('.score-composer')?.text?.trim() || '';
      const xmlLink = element.querySelector('a[href$=".xml"]')?.getAttribute('href');

      if (!xmlLink) continue;

      const titleSimilarity = calculateSimilarity(scoreTitle, title);
      const composerSimilarity = calculateSimilarity(scoreComposer, composer);
      const matchScore = (titleSimilarity * 0.6) + (composerSimilarity * 0.4);

      if (matchScore > bestMatchScore && matchScore > 0.7) {
        try {
          const xmlResponse = await fetchWithRetry(xmlLink);
          const musicXml = await xmlResponse.text();

          // Store in database
          await supabase.from('scores').insert({
            title: scoreTitle,
            composer: scoreComposer,
            music_xml: musicXml,
            source: 'openscore',
            metadata: {
              key: element.querySelector('.key')?.text?.trim(),
              timeSignature: element.querySelector('.time-signature')?.text?.trim()
            }
          });

          bestMatch = {
            title: scoreTitle,
            composer: scoreComposer,
            musicXmlUrl: musicXml,
            details: {
              key: element.querySelector('.key')?.text?.trim(),
              timeSignature: element.querySelector('.time-signature')?.text?.trim()
            }
          };
          bestMatchScore = matchScore;
        } catch (error) {
          console.error('Error fetching XML:', error);
          continue;
        }
      }
    }

    return bestMatch;
  } catch (error) {
    console.error('Error searching OpenScore:', error);
    return null;
  }
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