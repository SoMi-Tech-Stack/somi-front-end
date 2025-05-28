export interface GenerateLessonDto {
  theme: string;
  yearGroup: string;
  activityType?: string;
}

export async function fetchLessonActivity(dto: GenerateLessonDto) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/lessons/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error('Failed to generate lesson');
  }

  return response.json();
}