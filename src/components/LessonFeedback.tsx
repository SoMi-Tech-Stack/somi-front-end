import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { ActivityResponse } from '../types';
import { createFeedback } from '../modules/analytics';

type Props = {
  activity: ActivityResponse;
};

export const LessonFeedback = ({ activity }: Props) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, any> | null>(null);

  const submitFeedback = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Call the feedback analysis function
      const feedbackLesson = {
        lesson: activity,
        feedbackRate: rating,
        feedbackText: comments || '',
      }

      const success = await createFeedback(feedbackLesson);

      if (!success) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setSubmitted(false);
    setRating(0);
    setComments('');
  }, [activity]);

  if (submitted) {
    return (
      <div className="mt-6 text-center bg-[#F0F2FF] p-4 rounded-lg border border-[#F3F5FF]">
        <div className="space-y-4">
          <p className="text-somi-purple-700 font-medium">Thanks for your feedback!</p>
          
          {analysis && (
            <div className="text-left">
              <h4 className="font-semibold text-somi-purple-800 mb-2">AI Analysis Insights:</h4>
              
              {analysis.themeAnalysis && (
                <div className="mb-3">
                  <p className="text-sm text-somi-purple-600">Theme Effectiveness:</p>
                  <p className="text-somi-gray-700">{analysis.themeAnalysis.effectiveness}</p>
                </div>
              )}
              
              {analysis.recommendations?.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-somi-purple-600">Top Recommendation:</p>
                  <p className="text-somi-gray-700">{analysis.recommendations[0].description}</p>
                </div>
              )}
              
              {analysis.insights?.strengths?.length > 0 && (
                <div>
                  <p className="text-sm text-somi-purple-600">Key Strength:</p>
                  <p className="text-somi-gray-700">{analysis.insights.strengths[0]}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t-2 border-[#F3F5FF] pt-6">
      <h3 className="text-lg font-semibold text-somi-gray-800 mb-4">Was this lesson useful?</h3>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              rating >= star 
                ? 'text-yellow-400 scale-110' 
                : 'text-somi-gray-300 hover:text-yellow-300 hover:scale-105'
            }`}
            title={`${star} star${star !== 1 ? 's' : ''}`}
          >
            <Star className="w-6 h-6" fill={rating >= star ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
        <h4 className="text-somi-gray-700 font-medium mb-2">Optional Comments</h4>
      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        className="w-full p-4 border border-[#F3F5FF] rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-somi-purple-400 focus:border-transparent transition-all duration-200 hover:border-somi-purple-300 resize-none focus:outline-none focus-visible:outline-none"
        rows={3}
        placeholder="Optional comments..."
      />
      <button
        onClick={submitFeedback}
        disabled={!rating || isSubmitting}
        className="mt-4 w-full max-w-sm bg-gradient-to-r from-[#4f00ff] to-[#e600cc] text-white py-3 px-6 rounded-full font-semibold hover:from-[#3c00d0] hover:to-[#cc00b8] focus:outline-none focus:ring-2 focus:ring-[#c54bff] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </button>

    </div>
  );
};