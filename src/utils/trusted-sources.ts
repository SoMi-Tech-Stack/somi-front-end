// List of trusted educational music channels and their channel IDs
export const TRUSTED_CHANNELS = {
  'BBC': [
    'UCzH-hX3lv1IuGV7J3VygsA', // BBC Music
    'UCMf9JqrahFi9Nd8FZr8qmng', // BBC Teach
  ],
  'Philharmonia': [
    'UCIu1Pf3zOhAeKCG7tJWyRVw', // Philharmonia Orchestra
  ],
  'ClassicFM': [
    'UCM9B7T2YCNJ0PrMhZ9X4yXw', // Classic FM
    'UC3-U5N0qXkjVZB1Vv4A2vAg', // Classic FM Kids
  ],
  'DeutscheGrammophon': [
    'UC34DbNyD4dqRBKWPud7CyZQ', // Deutsche Grammophon
  ],
  'LondonSymphonyOrchestra': [
    'UCL7M9dQZ4Kn0z5QM5BzYk_Q', // LSO
  ],
  'WienerPhilharmoniker': [
    'UC5-2z5WXdGX1Ug6LxZ5gjrw', // Vienna Philharmonic
  ],
  'BerlinPhilharmoniker': [
    'UC1nnBF9jEnI0ybXUHgxeWxg', // Berlin Philharmonic
  ]
};

export function isYouTubeChannelTrusted(channelId: string): boolean {
  return Object.values(TRUSTED_CHANNELS)
    .flat()
    .includes(channelId);
}

export function getChannelIdFromUrl(url: string): string | null {
  try {
    const videoId = new URL(url).searchParams.get('v');
    if (!videoId) return null;

    // Fetch video details to get channel ID
    // Note: This would require YouTube Data API in production
    // For now, we'll mock this with a placeholder
    return 'UCzH-hX3lv1IuGV7J3VygsA'; // Mock BBC Music channel ID
  } catch {
    return null;
  }
}

export const FALLBACK_VIDEO = {
  url: 'https://www.youtube.com/watch?v=UCzH-hX3lv1IuGV7J3VygsA',
  channelId: 'UCzH-hX3lv1IuGV7J3VygsA',
  channelName: 'BBC Music'
};