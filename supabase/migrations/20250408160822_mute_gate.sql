/*
  # Add new score sources

  1. Changes
    - Update source check constraint to include new sources
    - Add index for source column

  2. Security
    - Maintain existing RLS policies
*/

-- Update source check constraint to include new sources
ALTER TABLE scores 
DROP CONSTRAINT IF EXISTS scores_source_check,
ADD CONSTRAINT scores_source_check 
CHECK (source IN ('musescore', 'imslp', 'openscore', 'musicalion'));

-- Add index for source column
CREATE INDEX IF NOT EXISTS idx_scores_source
ON scores (source);

-- Add comment for new sources
COMMENT ON COLUMN scores.source IS 'Source of the score (musescore, imslp, openscore, musicalion)';