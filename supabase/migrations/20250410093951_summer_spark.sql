/*
  # Add analytics insights table

  1. New Tables
    - `analytics_insights`
      - `id` (uuid, primary key)
      - `analysis` (jsonb, stores LLM analysis results)
      - `data_points` (integer, number of data points analyzed)
      - `generated_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policy for service role to manage insights
    - Add policy for authenticated users to read insights
*/

CREATE TABLE analytics_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis jsonb NOT NULL,
  data_points integer NOT NULL,
  generated_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analytics_insights ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read insights
CREATE POLICY "Users can read insights"
  ON analytics_insights
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to manage insights
CREATE POLICY "Service role can manage insights"
  ON analytics_insights
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_analytics_insights_updated_at
  BEFORE UPDATE ON analytics_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes
CREATE INDEX idx_analytics_insights_generated_at 
  ON analytics_insights (generated_at DESC);

-- Add comments
COMMENT ON TABLE analytics_insights IS 'Stores ML-generated insights from activity analytics';
COMMENT ON COLUMN analytics_insights.analysis IS 'JSON structure containing patterns, recommendations, and insights';
COMMENT ON COLUMN analytics_insights.data_points IS 'Number of activity records analyzed';
COMMENT ON COLUMN analytics_insights.generated_at IS 'When the analysis was performed';