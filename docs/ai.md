# AI Integration Documentation

## Overview

The AI integration module provides:
- Activity generation using multiple LLM providers
- Prompt engineering and templates
- Response validation and safety checks
- Analytics processing

## Architecture

```
lib/ai/
├── providers/          # LLM provider implementations
├── templates/          # Prompt templates
├── validation/         # Response validation
└── types/             # TypeScript definitions
```

## Providers

### Google Gemini

Primary provider for activity generation.

```typescript
interface GeminiConfig {
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

class GeminiProvider implements AIProvider {
  async generateActivity(params: ActivityParams): Promise<ActivityResponse>;
  async analyzePerformance(audio: Blob): Promise<PerformanceAnalysis>;
}
```

#### Usage
```typescript
const gemini = new GeminiProvider({
  apiKey: process.env.VITE_GEMINI_API_KEY,
  temperature: 0.7
});

const activity = await gemini.generateActivity({
  yearGroup: 'Year 4',
  theme: 'Space'
});
```

### OpenAI (Planned)

Backup provider for activity generation.

```typescript
interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
}
```

## Prompt Templates

Structured templates for consistent AI responses.

### Listening Activity Template

```typescript
const listeningActivityTemplate: PromptTemplate = {
  template: `Generate a listening-focused music activity...`,
  variables: {
    yearGroup: string;
    theme: string;
  },
  constraints: [
    "Age-appropriate content",
    "Classical/folk music only",
    // ...
  ],
  format: "JSON"
};
```

### Performance Analysis Template

```typescript
const performanceAnalysisTemplate: PromptTemplate = {
  template: `Analyze this musical performance...`,
  variables: {
    audioFeatures: AudioFeatures;
  },
  format: "JSON"
};
```

## Response Validation

Ensures AI responses meet safety and quality standards.

```typescript
interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

function validateActivityResponse(
  response: unknown
): ValidationResult;
```

### Safety Checks

1. Content Filtering
```typescript
const safetySettings = {
  HARM_CATEGORY_HARASSMENT: "BLOCK_MEDIUM_AND_ABOVE",
  HARM_CATEGORY_HATE_SPEECH: "BLOCK_MEDIUM_AND_ABOVE",
  HARM_CATEGORY_SEXUALLY_EXPLICIT: "BLOCK_MEDIUM_AND_ABOVE",
  HARM_CATEGORY_DANGEROUS_CONTENT: "BLOCK_MEDIUM_AND_ABOVE"
};
```

2. Age Appropriateness
```typescript
function checkAgeAppropriateness(
  content: string,
  yearGroup: string
): boolean;
```

## Analytics Processing

Analyzes activity data for insights.

```typescript
interface AnalyticsProcessor {
  processActivityData(
    data: ActivityAnalytics[]
  ): Promise<AnalyticsInsight>;
}
```

### Insight Generation

```typescript
interface AnalyticsInsight {
  patterns: {
    successful: string[];
    unsuccessful: string[];
  };
  themes: {
    popular: string[];
    underutilized: string[];
  };
  correlations: Array<{
    factor: string;
    observation: string;
  }>;
  recommendations: Array<{
    type: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }>;
}
```

## Error Handling

Robust error handling for AI operations.

```typescript
class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
  }
}

// Usage
try {
  const activity = await generateActivity(params);
} catch (error) {
  if (error instanceof AIError) {
    switch (error.code) {
      case 'INVALID_RESPONSE':
        // Handle invalid AI response
        break;
      case 'API_ERROR':
        // Handle API error
        break;
      // ...
    }
  }
}
```

## Best Practices

1. Prompt Engineering
- Use clear, specific instructions
- Include examples
- Define constraints
- Specify output format

2. Error Handling
- Implement retries with backoff
- Provide fallback options
- Log errors for analysis

3. Response Processing
- Validate response format
- Check content safety
- Transform to application format

4. Performance
- Cache common responses
- Implement request queuing
- Monitor API usage

## Testing

```typescript
describe('AI Integration', () => {
  it('generates valid activities', async () => {
    const activity = await generateActivity({
      yearGroup: 'Year 4',
      theme: 'Space'
    });
    
    expect(activity).toMatchSchema(activitySchema);
  });

  it('handles API errors gracefully', async () => {
    // Test implementation
  });
});
```