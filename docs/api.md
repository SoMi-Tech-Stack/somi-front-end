# API Documentation

## Database API

The database layer is abstracted through the `DatabaseProvider` interface in `src/lib/database/index.ts`.

### Methods

#### `connect()`
Initialize database connection.

```typescript
async connect(): Promise<void>
```

#### `query<T>`
Execute a database query.

```typescript
async query<T>(table: string, query: {
  select?: string;
  where?: { field: string; value: any };
  orderBy?: string;
}): Promise<T[]>
```

#### `insert`
Insert a new record.

```typescript
async insert(table: string, data: any): Promise<any>
```

#### `update`
Update an existing record.

```typescript
async update(table: string, id: string, data: any): Promise<any>
```

#### `delete`
Delete a record.

```typescript
async delete(table: string, id: string): Promise<void>
```

### Usage Example

```typescript
import { getDatabase } from '@/lib/database';

const db = getDatabase();

// Query scores
const scores = await db.query('scores', {
  select: 'title,composer',
  where: { field: 'composer', value: 'Mozart' },
  orderBy: 'title'
});

// Insert new score
const newScore = await db.insert('scores', {
  title: 'Symphony No. 40',
  composer: 'Mozart'
});
```

## AI Integration

The AI module provides interfaces for different LLM providers.

### Supported Providers

- Google Gemini
- OpenAI (planned)
- Local models (planned)

### Usage

```typescript
import { generateListeningActivity } from '@/lib/ai';

const activity = await generateListeningActivity({
  yearGroup: 'Year 4',
  theme: 'Space'
});
```

## Analytics

Track user activities and collect feedback.

### Methods

#### `trackActivity`
```typescript
async function trackActivity(data: {
  activityType: 'listening' | 'lesson';
  inputData: Record<string, any>;
  outputData: Record<string, any>;
}): Promise<string>
```

#### `updateFeedback`
```typescript
async function updateFeedback(
  id: string,
  rating: number,
  text?: string
): Promise<boolean>
```

### Usage

```typescript
import { trackActivity, updateFeedback } from '@/lib/analytics';

// Track activity generation
const activityId = await trackActivity({
  activityType: 'listening',
  inputData: { yearGroup: 'Year 3', theme: 'Space' },
  outputData: generatedActivity
});

// Update feedback
await updateFeedback(activityId, 5, 'Great activity!');
```