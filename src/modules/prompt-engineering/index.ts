export * from './types';
export * from './templates';
export * from './generator';

// Re-export listeningActivityTemplate explicitly to ensure it's available
export { listeningActivityTemplate } from './templates';

// Example usage:
/*
import { generatePrompt, lessonPlanTemplate } from './prompt-engineering';

const prompt = generatePrompt(
  lessonPlanTemplate,
  {
    yearGroup: 'Year 2',
    topic: 'Pitch',
    framework: 'Kodály'
  },
  {
    temperature: 0.8
  }
);

// Use the generated prompt with your LLM service
*/