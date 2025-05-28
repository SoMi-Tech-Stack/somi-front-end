import express from 'express';
import cors from 'cors';
import knex from 'knex';
import { generateLessonFeedback } from './src/routes/api/generate-lesson-feedback';

const app = express();
const port = 3000;

// Initialize database connection
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './database.sqlite'
  },
  useNullAsDefault: true
});

// Ensure tables exist
async function initializeDatabase() {
  try {
    const hasScores = await db.schema.hasTable('scores');
    if (!hasScores) {
      await db.schema.createTable('scores', table => {
        table.uuid('id').primary().defaultTo(db.raw('(lower(hex(randomblob(4))) || lower(hex(randomblob(2))) || "4" || substr(lower(hex(randomblob(2))),2) || lower(hex(randomblob(6))))'));
        table.string('title').notNullable();
        table.string('composer').notNullable();
        table.text('music_xml');
        table.string('source');
        table.json('metadata');
        table.timestamps(true, true);
        table.unique(['title', 'composer']);
      });
    }

    const hasAnalytics = await db.schema.hasTable('activity_analytics');
    if (!hasAnalytics) {
      await db.schema.createTable('activity_analytics', table => {
        table.uuid('id').primary().defaultTo(db.raw('(lower(hex(randomblob(4))) || lower(hex(randomblob(2))) || "4" || substr(lower(hex(randomblob(2))),2) || lower(hex(randomblob(6))))'));
        table.string('activity_type').notNullable();
        table.json('input_data').notNullable();
        table.json('output_data').notNullable();
        table.integer('feedback_rating');
        table.string('feedback_text');
        table.timestamps(true, true);
      });
    }
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

// Initialize database before starting server
await initializeDatabase();

app.use(cors());
app.use(express.json());

// Add lesson feedback endpoint
app.post('/api/generate-lesson-feedback', generateLessonFeedback);

// Add analytics endpoints
app.post('/api/track-activity', async (req, res) => {
  try {
    const { activity_type, input_data, output_data } = req.body;
    
    if (!activity_type || !input_data || !output_data) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'activity_type, input_data, and output_data are required'
      });
    }
    
    // Insert activity into SQLite database
    try {
      const [id] = await db('activity_analytics')
        .insert({
          activity_type,
          input_data: JSON.stringify(input_data),
          output_data: JSON.stringify(output_data)
        })
        .returning('id');
      
      res.json({ id, success: true });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ 
        error: 'Database error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Error tracking activity:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/update-feedback', async (req, res) => {
  try {
    const { id, rating, text } = req.body;
    
    if (!id || typeof rating !== 'number') {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'id and rating are required'
      });
    }
    
    try {
      await db('activity_analytics')
        .where({ id })
        .update({
          feedback_rating: rating,
          feedback_text: text
        });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ 
        error: 'Database error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});