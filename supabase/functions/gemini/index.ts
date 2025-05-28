import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const generatePrompt = (yearGroup: string, theme: string) => `Generate a listening-focused music activity for ${yearGroup}, themed around "${theme}".

Key Requirements:
- Age-appropriate classical or folk music only
- Clear connection to the UK Music Curriculum
- Safe and educational content
- Engaging discussion questions
- Practical teaching tips

Include:
1. Musical piece selection
2. Historical and musical context
3. Specific learning focus
4. Discussion questions
5. Implementation guidance

The piece should be:
- Appropriate for ${yearGroup} students
- Related to the theme: ${theme}
- Available on YouTube (classical/folk recordings only)
- Historically or culturally significant

Return the response in this exact JSON format:
{
  "piece": {
    "title": "Full title of the piece",
    "composer": "Full name of composer",
    "youtubeLink": "URL to a high-quality recording",
    "details": {
      "yearComposed": "Year or period of composition",
      "about": "Brief composer/piece background focusing on theme connection",
      "sheetMusicUrl": "URL to sheet music (if available on IMSLP or similar)",
      "wikipediaUrl": "URL to Wikipedia article about the piece"
    }
  },
  "reason": "Clear explanation of why this piece fits the theme",
  "questions": [
    "3-5 discussion questions that connect the music to the theme"
  ],
  "teacherTip": "Practical guidance for theme-based exploration"
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please set it in your Supabase project settings.");
    }

    const { yearGroup, theme } = await req.json();
    const prompt = generatePrompt(yearGroup, theme);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
      throw new Error(data.error?.message || "Failed to generate listening activity");
    }

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});