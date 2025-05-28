# Database Schema Documentation

## Overview

The database schema is designed to support:
- Music score storage and retrieval
- Lesson history tracking
- Activity analytics
- ML-generated insights

## Tables

### scores

Stores MusicXML scores with metadata.

```sql
CREATE TABLE scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  composer text NOT NULL,
  music_xml text,
  source text CHECK (source IN ('musescore', 'imslp', 'openscore', 'musicalion')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(title, composer)
);
```

#### Indexes
- `idx_scores_search`: GiST index for text search on title and composer
- `idx_scores_source`: B-tree index on source column

#### RLS Policies
- Users can read all scores
- Service role can manage scores

### lesson_history

Tracks lesson history and curriculum evidence.

```sql
CREATE TABLE lesson_history (
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
  updated_at timestamptz DEFAULT now()
);
```

#### Indexes
- `idx_lesson_history_user_id`
- `idx_lesson_history_piece_id`
- `idx_lesson_history_year_group`

#### RLS Policies
- Users can read their own lesson history
- Service role can manage all lesson history

### activity_analytics

Tracks activity generation and user feedback.

```sql
CREATE TABLE activity_analytics (
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
```

#### Indexes
- `idx_activity_analytics_user_id`
- `idx_activity_analytics_type`
- `idx_activity_analytics_rating`

#### RLS Policies
- Users can read and update their own analytics
- Users can insert analytics for themselves
- Service role has full access

### analytics_insights

Stores ML-generated insights from analytics data.

```sql
CREATE TABLE analytics_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis jsonb NOT NULL,
  data_points integer NOT NULL,
  generated_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### Indexes
- `idx_analytics_insights_generated_at`

#### RLS Policies
- Users can read insights
- Service role can manage insights

## JSON Schemas

### creative_tasks
```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "type": { "enum": ["visual", "movement", "writing"] },
      "title": { "type": "string" },
      "description": { "type": "string" },
      "materials": { "type": "array", "items": { "type": "string" } },
      "duration": { "type": "string" }
    }
  }
}
```

### curriculum_evidence
```json
{
  "type": "object",
  "properties": {
    "mmcStrands": { "type": "array", "items": { "type": "string" } },
    "learningObjectives": { "type": "array", "items": { "type": "string" } },
    "assessment": {
      "type": "object",
      "properties": {
        "type": { "type": "string" },
        "criteria": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
```

## Migrations

Database migrations are managed through Supabase migrations in `/supabase/migrations/`.

To create a new migration:
1. Create a new SQL file in the migrations directory
2. Add the migration logic
3. Deploy through Supabase dashboard or CLI

## Backup and Recovery

Regular backups are handled by Supabase. For additional safety:

1. Export data periodically:
```bash
supabase db dump -f backup.sql
```

2. Restore from backup:
```bash
supabase db reset
supabase db push backup.sql
```