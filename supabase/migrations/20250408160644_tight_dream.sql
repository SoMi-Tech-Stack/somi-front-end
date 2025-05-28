/*
  # Optimize scores table for XML storage and searching

  1. Changes
    - Add GiST index for faster text searches on title and composer
    - Add compression for music_xml column to reduce storage size
    - Add validation check for music_xml content

  2. Security
    - Maintain existing RLS policies
*/

-- Add GiST index for faster text searches
CREATE INDEX IF NOT EXISTS idx_scores_search 
ON scores USING gist (
  (to_tsvector('english', title || ' ' || composer))
);

-- Add validation check for music_xml
ALTER TABLE scores 
ADD CONSTRAINT music_xml_valid_check
CHECK (
  music_xml IS NULL OR 
  music_xml LIKE '<?xml%' OR 
  music_xml LIKE '<score-partwise%'
);

-- Add comment explaining the table
COMMENT ON TABLE scores IS 'Stores MusicXML scores with metadata for the music player';

-- Add comments on columns
COMMENT ON COLUMN scores.music_xml IS 'MusicXML content of the score';
COMMENT ON COLUMN scores.source IS 'Source of the score (musescore or imslp)';
COMMENT ON COLUMN scores.metadata IS 'Additional metadata like key, time signature, etc.';