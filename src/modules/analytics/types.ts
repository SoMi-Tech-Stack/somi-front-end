/**
 * @fileoverview Type definitions for analytics and feedback data
 * These types ensure type safety throughout the analytics system
 */

export interface AnalyticsData {
  activityType: 'listening' | 'lesson';
  inputData: Record<string, any>;
  outputData: Record<string, any>;
}

/**
 * Response from analytics tracking endpoints
 */
export interface AnalyticsResponse {
  id: string;
  success: boolean;
  error?: string;
}

/**
 * User feedback data structure
 */
export interface FeedbackData {
  id: string;
  rating: number;
  text?: string;
}

/**
 * ML-generated insights from analytics data
 */
export interface AnalyticsInsight {
  id: string;
  analysis: {
    patterns: {
      successful: string[];
      unsuccessful: string[];
    };
    themes: {
      popular: string[];
      underutilized: string[];
    };
    correlations: Array<{
      factor: string;
      observation: string;
    }>;
    recommendations: Array<{
      type: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      impact: string;
    }>;
  };
  dataPoints: number;
  generatedAt: string;
}