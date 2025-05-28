# Component Documentation

## Overview

The component library is built with React and Tailwind CSS, focusing on:
- Reusability
- Accessibility
- Performance
- Type safety

## Core Components

### ActivityForm

Form component for generating listening activities.

```typescript
interface Props {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

interface FormData {
  yearGroup: YearGroup;
  theme: string;
  energyLevel: EnergyLevel;
}
```

#### Usage
```tsx
<ActivityForm
  onSubmit={handleSubmit}
  isLoading={isLoading}
/>
```

### ActivityOutput

Displays generated listening activity with feedback collection.

```typescript
interface Props {
  activity: ActivityResponse;
  isLoading: boolean;
  onRegenerate: () => void;
  analyticsId?: string;
}
```

#### Features
- YouTube video embedding
- Music notation display
- Performance recording
- Feedback collection

### AudioPlayer

Advanced audio player with waveform visualization.

```typescript
interface Props {
  audioUrl: string;
  title: string;
}
```

#### Features
- Waveform visualization
- Volume control
- Playback controls
- Error handling

### AudioRecorder

Records and analyzes student performances.

```typescript
interface Props {
  onRecordingComplete: (
    audioBlob: Blob,
    analysis: AudioAnalysis
  ) => void;
}

interface AudioAnalysis {
  pitch: number;
  rhythm: number;
  overall: number;
  matchedNotes: string[];
}
```

#### Features
- Real-time waveform display
- Performance analysis
- MP3 conversion
- Error handling

### FeedbackButtons

Collects user feedback on activities.

```typescript
interface Props {
  analyticsId: string;
  initialRating?: number;
  onFeedbackSubmit?: (rating: number) => void;
}
```

#### Usage
```tsx
<FeedbackButtons
  analyticsId="123"
  onFeedbackSubmit={handleFeedback}
/>
```

### MusicPlayer

Displays and plays music notation.

```typescript
interface Props {
  xmlUrl: string;
  title: string;
  youtubeId?: string;
}
```

#### Features
- MusicXML rendering
- MIDI playback
- YouTube integration
- Zoom controls

## Utility Components

### SomiLogo

SVG logo component with animation support.

```typescript
interface Props {
  className?: string;
}
```

### YouTubeEmbed

Safe YouTube video embedding with source verification.

```typescript
interface Props {
  videoId: string;
  title: string;
  channelId?: string;
}
```

## Styling

Components use Tailwind CSS with a custom theme:

```javascript
// tailwind.config.js
{
  theme: {
    extend: {
      colors: {
        somi: {
          purple: {
            50: '#F6F4F7',
            // ...
            900: '#2B1F2C'
          },
          // ...
        }
      }
    }
  }
}
```

## Best Practices

1. Component Organization
```
components/
├── ComponentName/
│   ├── index.tsx
│   ├── styles.css (if needed)
│   └── types.ts
└── index.ts
```

2. Props Interface
- Always define and export prop interfaces
- Use descriptive names
- Document complex props

3. Error Handling
- Implement error boundaries
- Provide fallback UI
- Log errors appropriately

4. Performance
- Use React.memo when beneficial
- Implement proper cleanup in useEffect
- Optimize re-renders

5. Accessibility
- Use semantic HTML
- Include ARIA attributes
- Support keyboard navigation

## Testing

Components should have comprehensive tests:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';

describe('ActivityForm', () => {
  it('submits form data correctly', () => {
    const onSubmit = jest.fn();
    render(<ActivityForm onSubmit={onSubmit} />);
    
    // Test implementation
  });
});
```