import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface AnalyticsData {
  activity_type: string;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  feedback_rating?: number;
  feedback_text?: string;
}

async function analyzeActivityData(data: AnalyticsData[]): Promise<string> {
  const prompt = `Analyze this set of music education activities and their feedback to generate insights and recommendations.

Activity Data:
${JSON.stringify(data, null, 2)}

Focus on:
1. Patterns in successful vs unsuccessful activities
2. Common themes in user inputs
3. Correlation between activity types and feedback
4. Areas for improvement in prompt engineering
5. Suggestions for new features or modifications

Provide analysis in this JSON format:
{
  "patterns": {
    "successful": ["pattern 1", "pattern 2"],
    "unsuccessful": ["pattern 1", "pattern 2"]
  },
  "themes": {
    "popular": ["theme 1", "theme 2"],
    "underutilized": ["theme 1", "theme 2"]
  },
  "correlations": [
    {
      "factor": "description",
      "observation": "details"
    }
  ],
  "promptImprovements": [
    {
      "current": "current approach",
      "suggested": "improved approach",
      "reasoning": "explanation"
    }
  ],
  "recommendations": [
    {
      "type": "feature|modification",
      "description": "details",
      "priority": "high|medium|low",
      "impact": "explanation"
    }
  ]
}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })
  });

  const result = await response.json();
  return result.candidates[0].content.parts[0].text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is required");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch recent analytics data
    const { data: analyticsData, error: fetchError } = await supabase
      .from("activity_analytics")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (fetchError) throw fetchError;

    // Analyze the data
    const analysis = await analyzeActivityData(analyticsData);

    // Store the analysis results
    const { error: insertError } = await supabase
      .from("analytics_insights")
      .insert({
        analysis: JSON.parse(analysis),
        data_points: analyticsData.length,
        generated_at: new Date().toISOString()
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, analysis: JSON.parse(analysis) }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
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