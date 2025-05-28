import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface FeedbackData {
  theme: string;
  year_group: string;
  rating: number;
  feedback_text?: string;
}

async function analyzeFeedback(data: FeedbackData): Promise<Record<string, any>> {
  try {
    const prompt = `Analyze this music education feedback to generate insights and recommendations.

Feedback Data:
- Theme: ${data.theme}
- Year Group: ${data.year_group}
- Rating: ${data.rating}/5
${data.feedback_text ? `- Comments: ${data.feedback_text}` : ''}

Focus on:
1. Theme effectiveness for the year group
2. Potential areas for improvement
3. Recommendations for future activities
4. Correlation with curriculum objectives

Provide analysis in this JSON format:
{
  "themeAnalysis": {
    "effectiveness": "rating and explanation",
    "ageAppropriateness": "analysis of suitability",
    "curriculumAlignment": "how well it aligns with objectives"
  },
  "recommendations": [
    {
      "type": "improvement|enhancement",
      "description": "detailed suggestion",
      "priority": "high|medium|low",
      "impact": "expected benefit"
    }
  ],
  "insights": {
    "strengths": ["identified strengths"],
    "challenges": ["potential challenges"],
    "opportunities": ["areas for development"]
  }
}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "User-Agent": "Supabase Edge Function"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    return JSON.parse(result.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase configuration is missing");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const feedbackData: FeedbackData = await req.json();
    
    // Analyze the feedback
    const analysis = await analyzeFeedback(feedbackData);

    // Store feedback with analysis
    const { data, error } = await supabase
      .from("activity_analytics")
      .insert({
        activity_type: "lesson",
        input_data: {
          theme: feedbackData.theme,
          year_group: feedbackData.year_group
        },
        output_data: { analysis },
        feedback_rating: feedbackData.rating,
        feedback_text: feedbackData.feedback_text
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : undefined
      }),
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