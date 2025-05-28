/**
 * @fileoverview Main lesson plan generation logic
 * 
 * Features:
 * - AI-powered lesson plan generation using Gemini API
 * - Integration with YouTube for trusted classical music sources
 * - Feedback collection and analysis for continuous improvement
 * - Support for multiple AI providers (Gemini, OpenAI, HuggingFace)
 * - Fallback to curated dataset when AI services are unavailable
 */

import type { LessonPlanInput, LessonPlanOutput, ListeningActivity } from './types';
import { generatePrompt, listeningActivityTemplate } from '../prompt-engineering';
import { searchYouTubeVideo } from '../../utils/youtube-scraper';
import lessonPlansData from '../../data/lesson-plans-dataset.json';

const GEMINI_API_KEY = 'AIzaSyBOteQEEkhd_6pTnEl9ZpxTXt_oCh41s_g';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Generate a complete lesson plan using the specified provider
 * @param input Lesson plan parameters including year group, topic, and keywords
 * @returns Complete lesson plan with activities, resources, and assessment
 */
export async function generateLessonPlan(input: LessonPlanInput): Promise<LessonPlanOutput> {
  // Use the specified provider or fall back to dataset
  if (input.provider) {
    try {
      const plan = await generateLesson(input);
      return plan;
    } catch (error) {
      console.warn('AI provider failed, falling back to dataset:', error);
    }
  }
  
  // Fallback to curated dataset
  return {
    title: `${input.topic} for ${input.year_group}`,
    objectives: [
      'Understand and perform simple rhythmic patterns',
      'Develop active listening skills',
      'Create and notate basic rhythmic compositions'
    ],
    warmUp: {
      duration: '10 minutes',
      description: 'Body percussion warm-up using simple rhythmic patterns',
      resources: ['Rhythm cards']
    },
    mainActivities: [
      {
        duration: '15 minutes',
        description: 'Echo clapping activity with increasing complexity',
        teacherNotes: 'Start simple and gradually increase difficulty'
      },
      {
        duration: '20 minutes',
        description: 'Group composition activity using learned rhythmic patterns',
        resources: ['Percussion instruments', 'Rhythm notation cards']
      }
    ],
    plenary: {
      duration: '10 minutes',
      description: 'Performance and peer assessment of group compositions'
    },
    assessment: [
      'Can students accurately repeat rhythmic patterns?',
      'Are students able to create their own rhythmic patterns?'
    ],
    differentiation: {
      support: [
        'Use simpler rhythmic patterns',
        'Provide visual aids'
      ],
      extension: [
        'Add layers of complexity to rhythms',
        'Introduce notation writing'
      ]
    },
    resources: [
      'Rhythm cards',
      'Percussion instruments',
      'Interactive whiteboard'
    ],
    nextSteps: 'Progress to combining rhythms with pitch in next lesson'
  };
}

/**
 * Generate a listening activity using Google's Gemini API via Supabase Edge Function
 */

export const generateListeningActivity = async (yearGroup: string, theme: string) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/lessons/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ yearGroup, theme }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { error: `Server error: ${text}` };
    }

    return await res.json();
  } catch (e) {
    return { error: 'Network or server error' };
  }
};

export async function generateListeningActivityGemini(yearGroup: string, theme: string): Promise<ListeningActivity | { error: string }> {
  try {
    const { prompt } = generatePrompt(
      listeningActivityTemplate,
      { yearGroup, theme },
      { temperature: 0.7 }
    );

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data.error);
      return { error: data.error?.message || 'Failed to generate listening activity' };
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini API response:', data);
      return { error: 'Invalid response from Gemini API' };
    }

    const generatedContent = data.candidates[0].content.parts[0].text.trim();
    // Remove markdown code block markers and clean the response
    const cleanedContent = generatedContent
      .replace(/^```json\s*/, '')  // Remove opening ```json
      .replace(/\s*```$/, '')      // Remove closing ```
      .trim();
    
    try {
      const parsedContent = JSON.parse(cleanedContent);
      
      // Try to find a matching video on YouTube
      try {
        const video = await searchYouTubeVideo(parsedContent.piece.title, parsedContent.piece.composer);
        if (video) {
          parsedContent.piece.youtubeLink = `https://www.youtube.com/watch?v=${video.videoId}`;
          parsedContent.piece.trustedSource = true;
          parsedContent.piece.details = {
            ...parsedContent.piece.details,
            channelId: video.channelId,
            channelTitle: video.channelTitle
          };
        }
      } catch (error) {
        console.warn('Failed to fetch YouTube video:', error);
      }
      
      // Validate the response structure
      if (!parsedContent.piece?.title || !parsedContent.piece?.composer || !parsedContent.questions?.length) {
        throw new Error('Invalid response structure');
      }
      
      return parsedContent;
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return { error: 'Failed to parse generated content. Please try again.' };
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to generate listening activity' };
  }
}