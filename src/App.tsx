import React, { useRef } from 'react';
import { Music } from 'lucide-react';
import { ActivityForm } from './components/ActivityForm';
import { ActivityOutput } from './components/ActivityOutput';
import { FeedbackButtons } from './components/FeedbackButtons';
import type { ActivityResponse, FormData } from './types';
import { SomiLogo } from './components/SomiLogo';
import { trackActivity } from './modules/analytics';
import { fetchLessonActivity } from './routes/api/generate-lesson-gpt-new';

function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [activity, setActivity] = React.useState<ActivityResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [analyticsId, setAnalyticsId] = React.useState<string | null>(null);
  const [currentFormData, setCurrentFormData] = React.useState<FormData | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  console.log('API URL:', import.meta.env.VITE_API_URL);
  
  const generateActivity = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setCurrentFormData(formData);
    
    try {
      const result = await fetchLessonActivity(formData);
        
      if ('error' in result) {
        setError(result.error);
      } else {
        setActivity(result);
        // Track activity generation only if successful

        setTimeout(() => {
          outputRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        const id = await trackActivity({
          activityType: 'listening',
          inputData: formData,
          outputData: result
        });
        // Only set analytics ID if we got a valid ID back
        if (id) {
          setAnalyticsId(id);
        }
      }
    } catch (error) {
      console.error('Failed to generate activity:', error);
      setError('Failed to generate activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-[#F0F2FF]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="flex items-center mt-4 sm:mt-0 flex-col sm:flex-row justify-center gap-6 mb-8">
            <div className="relative">
            </div>
            <h1 className="text-5xl font-semibold text-somi-gray-800">
              Listening Activity Generator
            </h1>
          </div>
          <p className="text-lg text-somi-gray-600 max-w-2xl mx-auto">
            Create engaging music listening activities for your primary classroom in seconds
          </p>
        </div>

        <div className="flex flex-col items-center gap-10">
          <ActivityForm onSubmit={generateActivity} isLoading={isLoading} />
          {error && (
            <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 shadow-sm backdrop-blur-sm">
              {error}
            </div>
          )}
          {activity && currentFormData && (
            <div ref={outputRef} className="space-y-4">
              <ActivityOutput
                activity={activity}
                onRegenerate={() => currentFormData && generateActivity(currentFormData)}
                isLoading={isLoading}
                analyticsId={analyticsId}
                yearGroup={currentFormData.yearGroup}
                theme={currentFormData.theme}
                energyLevel={currentFormData.energyLevel}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;