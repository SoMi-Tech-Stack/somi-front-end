/**
 * @fileoverview YouTube integration for finding trusted classical music recordings
 * Currently uses a mock implementation, but designed to use YouTube Data API in production
 */

import { TRUSTED_CHANNELS } from './trusted-sources';

interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelId: string;
  channelTitle: string;
  description: string;
}

/**
 * Extract video ID from various YouTube URL formats
 * @param url YouTube video URL
 * @returns Video ID if valid, null otherwise
 */
function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    
    if (hostname === 'www.youtube.com' || hostname === 'youtube.com') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
      
      const embedPath = urlObj.pathname.match(/^\/embed\/([^/]+)/);
      if (embedPath) return embedPath[1];
    }
    
    return null;
  } catch (e) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?/]+)/);
    return match ? match[1] : null;
  }
}

/**
 * Search for a classical music video from trusted sources
 * @param title Piece title
 * @param composer Composer name
 * @returns Video details if found, null otherwise
 * TODO: Replace mock implementation with YouTube Data API
 */
export async function searchYouTubeVideo(title: string, composer: string): Promise<YouTubeSearchResult | null> {
  try {
    const searchQuery = encodeURIComponent(`${title} ${composer} classical music`);
    
    // Mock implementation for development
    // In production, this would use the YouTube Data API
    return {
      videoId: 'FoD_AxKoJDs',
      title: `${title} - ${composer}`,
      channelId: 'UCM9B7T2YCNJ0PrMhZ9X4yXw', // Classic FM channel ID
      channelTitle: 'Classic FM',
      description: 'Classical performance'
    };
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return null;
  }
}

export function generateEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}