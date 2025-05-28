/*
  # Add analytics and feedback tracking

  1. New Tables
    - `activity_analytics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `activity_type` (text, either 'listening' or 'lesson')
      - `input_data` (jsonb, stores user input parameters)
      - `output_data` (jsonb, stores generated content)
      - `feedback_rating` (integer, 1 for thumbs down, 5 for thumbs up)
      - `feedback_text` (text, optional user comments)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for user access and service role management
*/

CREATE TABLE IF NOT EXISTS activity_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  activity_type text CHECK (activity_type IN ('listening', 'lesson')),
  input_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  feedback_rating integer CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE activity_analytics ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own analytics
CREATE POLICY "Users can read own analytics"
  ON activity_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own analytics
CREATE POLICY "Users can insert own analytics"
  ON activity_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own feedback
CREATE POLICY "Users can update own feedback"
  ON activity_analytics
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow service role full access
CREATE POLICY "Service role can manage analytics"
  ON activity_analytics
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_activity_analytics_updated_at
  BEFORE UPDATE ON activity_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes
CREATE INDEX idx_activity_analytics_user_id ON activity_analytics (user_id);
CREATE INDEX idx_activity_analytics_type ON activity_analytics (activity_type);
CREATE INDEX idx_activity_analytics_rating ON activity_analytics (feedback_rating);

-- Add comments
COMMENT ON TABLE activity_analytics IS 'Tracks activity generation and user feedback';
COMMENT ON COLUMN activity_analytics.input_data IS 'User input parameters for activity generation';
COMMENT ON COLUMN activity_analytics.output_data IS 'Generated activity content';
COMMENT ON COLUMN activity_analytics.feedback_rating IS '1 for thumbs down, 5 for thumbs up';