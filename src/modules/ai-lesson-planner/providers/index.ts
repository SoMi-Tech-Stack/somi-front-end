import type { LessonPlanInput, LessonPlanOutput } from '../types';
import { generateGeminiLesson } from './gemini';
import { generateOpenAILesson } from './openai';
import { generateHuggingFaceLesson } from './huggingface';
import { generateDatasetLesson } from './dataset';

export async function generateLesson(input: LessonPlanInput): Promise<LessonPlanOutput> {
  switch (input.provider) {
    case 'gemini':
      return generateGeminiLesson(input);
    case 'openai':
      return generateOpenAILesson(input);
    case 'huggingface':
      return generateHuggingFaceLesson(input);
    case 'dataset':
    default:
      return generateDatasetLesson(input);
  }
}