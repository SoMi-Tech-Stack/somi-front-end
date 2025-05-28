import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { generatePrompt, listeningActivityTemplate } from '../../modules/prompt-engineering';

const GEMINI_API_KEY = 'AIzaSyBOteQEEkhd_6pTnEl9ZpxTXt_oCh41s_g';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function generateListeningLessonGemini(req: Request, res: Response) {
  try {
    const { yearGroup, theme } = req.body;

    if (!yearGroup || !theme) {
      return res.status(400).json({ error: 'Year group and theme are required' });
    }

    const { prompt } = generatePrompt(
      listeningActivityTemplate,
      { yearGroup, theme }
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
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(500).json({ error: 'Failed to generate listening activity' });
    }

    // Parse and format the response
    const generatedContent = data.candidates[0].content.parts[0].text;
  
    let formattedResponse;
    
    try {
      formattedResponse = JSON.parse(generatedContent);
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return res.status(500).json({ error: 'Failed to parse generated content' });
    }

    res.json(formattedResponse);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}