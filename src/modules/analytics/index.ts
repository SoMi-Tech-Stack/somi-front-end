/**
 * @fileoverview Analytics module for tracking activity generation and user feedback
 * Handles communication with the analytics API endpoints and provides type-safe interfaces
 */

import { ActivityResponse } from '../../types';
import type { AnalyticsData, AnalyticsResponse } from './types';

// Utility function for making analytics API requests with proper error handling
async function sendAnalyticsRequest(endpoint: string, data: any): Promise<Response> {
  const response = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Analytics request failed: ${response.status} ${response.statusText}`);
  }

  return response;
}

/**
 * Track activity generation with input parameters and output results
 * @param data Analytics data including activity type, input, and output
 * @returns Activity ID if successful, null otherwise
 */
export async function trackActivity(data: AnalyticsData): Promise<string | null> {
  try {
    const response = await sendAnalyticsRequest('track-activity', {
      activity_type: data.activityType,
      input_data: data.inputData,
      output_data: data.outputData
    });

    const result: AnalyticsResponse = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error tracking activity:', error);
    return null;
  }
}

/**
 * Update feedback for a specific activity
 * @param id Activity ID to update
 * @param rating Feedback rating (1 for thumbs down, 5 for thumbs up)
 * @param text Optional feedback text
 * @returns Success status
 */
interface createFeedbackAndLesson {
  lesson: ActivityResponse;
  feedbackRate: number;
  feedbackText?: string;
}
  
export const createFeedback = async (feedback: createFeedbackAndLesson) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/feedback/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      throw new Error('Failed to create feedback');
    }

    const result = await response.json();
    return result; // { message, feedbackId, lessonId }
  } catch (error) {
    console.error('Error creating feedback:', error);
    return null;
  }
};