/*
  # Create scores table for storing music data

  1. New Tables
    - `scores`
      - `id` (uuid, primary key)
      - `title` (text)
      - `composer` (text)
      - `music_xml` (text, stores the MusicXML content)
      - `source` (text, either 'musescore' or 'imslp')
      - `metadata` (jsonb, stores additional score details)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `scores` table
    - Add policy for authenticated users to read scores
    - Add policy for service role to insert/update scores
*/

CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  composer text NOT NULL,
  music_xml text,
  source text CHECK (source IN ('musescore', 'imslp')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(title, composer)
);

-- Enable RLS
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read scores
CREATE POLICY "Users can read scores"
  ON scores
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to manage scores
CREATE POLICY "Service role can manage scores"
  ON scores
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scores_updated_at
  BEFORE UPDATE ON scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();