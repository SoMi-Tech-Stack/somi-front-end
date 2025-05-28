/*
  # Add lesson history table for curriculum evidence tracking

  1. New Tables
    - `lesson_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `piece_id` (uuid, references scores)
      - `year_group` (text)
      - `theme` (text)
      - `creative_tasks` (jsonb)
      - `next_steps` (jsonb)
      - `curriculum_evidence` (jsonb)
      - `worksheet_data` (jsonb)
      - `slides_data` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `lesson_history` table
    - Add policy for users to read their own lesson history
    - Add policy for service role to manage all lesson history
*/

-- Create lesson history table
CREATE TABLE IF NOT EXISTS lesson_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  piece_id uuid REFERENCES scores NOT NULL,
  year_group text NOT NULL,
  theme text NOT NULL,
  creative_tasks jsonb DEFAULT '[]'::jsonb,
  next_steps jsonb DEFAULT '{}'::jsonb,
  curriculum_evidence jsonb DEFAULT '{}'::jsonb,
  worksheet_data jsonb DEFAULT '{}'::jsonb,
  slides_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_creative_tasks CHECK (jsonb_typeof(creative_tasks) = 'array'),
  CONSTRAINT valid_next_steps CHECK (jsonb_typeof(next_steps) = 'object'),
  CONSTRAINT valid_curriculum_evidence CHECK (jsonb_typeof(curriculum_evidence) = 'object'),
  CONSTRAINT valid_worksheet_data CHECK (jsonb_typeof(worksheet_data) = 'object'),
  CONSTRAINT valid_slides_data CHECK (jsonb_typeof(slides_data) = 'object')
);

-- Enable RLS
ALTER TABLE lesson_history ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own lesson history
CREATE POLICY "Users can read own lesson history"
  ON lesson_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for service role to manage all lesson history
CREATE POLICY "Service role can manage lesson history"
  ON lesson_history
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_lesson_history_updated_at
  BEFORE UPDATE ON lesson_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for common queries
CREATE INDEX idx_lesson_history_user_id ON lesson_history (user_id);
CREATE INDEX idx_lesson_history_piece_id ON lesson_history (piece_id);
CREATE INDEX idx_lesson_history_year_group ON lesson_history (year_group);

-- Add comments
COMMENT ON TABLE lesson_history IS 'Stores lesson history and curriculum evidence for teachers';
COMMENT ON COLUMN lesson_history.creative_tasks IS 'Array of visual art and movement tasks';
COMMENT ON COLUMN lesson_history.next_steps IS 'Follow-up listening and activity suggestions';
COMMENT ON COLUMN lesson_history.curriculum_evidence IS 'MMC strands and learning objectives';
COMMENT ON COLUMN lesson_history.worksheet_data IS 'Data for generating student worksheets';
COMMENT ON COLUMN lesson_history.slides_data IS 'Data for generating presentation slides';