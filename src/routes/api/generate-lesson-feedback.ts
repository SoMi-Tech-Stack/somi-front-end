import type { RequestHandler } from 'express';
import { getDatabase } from '../../lib/database';

// TODO: Integrate feedback into AI generation (e.g. RAG or prompt weighting)
// Logged data available in /data/lesson-feedback.json for analysis

export const generateLessonFeedback: RequestHandler = async (req, res) => {
  const { theme, year_group, rating, comments } = req.body;

  if (!theme || !year_group || !rating) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const db = getDatabase();
    
    const feedback = {
      activity_type: 'lesson',
      input_data: { theme, year_group },
      output_data: {},
      feedback_rating: rating,
      feedback_text: comments || ''
    };

    const result = await db.insert('activity_analytics', feedback);
    
    return res.status(200).json({ 
      message: 'Feedback saved.',
      id: result.id 
    });
  } catch (error) {
    console.error('Feedback Error:', error);
    return res.status(500).json({ error: 'Failed to save feedback.' });
  }
};