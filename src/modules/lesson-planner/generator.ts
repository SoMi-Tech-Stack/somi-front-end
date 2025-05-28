import lessonPlansData from '../../data/lesson-plans-dataset.json';
import type { LessonPlan, GeneratorResponse } from './types';

/**
 * Generate a lesson plan based on year group and topic.
 * Currently reads from a static JSON file.
 * This is a placeholder for future AI integration.
 */
export function generateLessonPlan(yearGroup: string, topic: string): GeneratorResponse {
  try {
    const plans = lessonPlansData as LessonPlan[];
    
    const matchingPlan = plans.find(
      plan => plan.year_group === yearGroup && plan.topic === topic
    );

    if (matchingPlan) {
      return { plan: matchingPlan };
    }

    return { message: "No matching lesson plan found." };
    
  } catch (error) {
    return { error: "Failed to load lesson plans dataset." };
  }
}