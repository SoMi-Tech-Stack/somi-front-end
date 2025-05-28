import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { createFeedback } from '../modules/analytics';
import { ActivityResponse } from '../types';

interface Props {
  initialRating?: number;
  activity: ActivityResponse;
}

export function FeedbackButtons({activity, initialRating }: Props) {
  const [rating, setRating] = React.useState<number | null>(initialRating || null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showTextInput, setShowTextInput] = React.useState(false);
  const [feedbackText, setFeedbackText] = React.useState('');

  const submitFeedback = async (newRating: number, text?: string) => {
    if (isSubmitting) return;
    console.log('submitting feedback', { newRating, text });
    
    
    setIsSubmitting(true);
    try {
      const feedbackLesson = {
        lesson: activity,
        feedbackRate: newRating,
        feedbackText: text || '',
      }
      const success = await createFeedback(feedbackLesson);

      if (!success) throw new Error('Failed to update feedback');
      
      setRating(newRating);
      if (text) setShowTextInput(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating) {
      submitFeedback(rating, feedbackText);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <button
          onClick={() => submitFeedback(1)}
          disabled={isSubmitting || rating === 1}
          className={`p-2 rounded-lg transition-colors ${
            rating === 1
              ? 'bg-red-100 text-red-700 scale-110'
              : 'hover:bg-gray-100 text-gray-600 hover:scale-105'
          }`}
          title="Not helpful"
        >
          <ThumbsDown className="w-5 h-5" />
        </button>
        <button
          onClick={() => submitFeedback(5)}
          disabled={isSubmitting || rating === 5}
          className={`p-2 rounded-lg transition-colors ${
            rating === 5
              ? 'bg-green-100 text-green-700 scale-110'
              : 'hover:bg-gray-100 text-gray-600 hover:scale-105'
          }`}
          title="Helpful"
        >
          <ThumbsUp className="w-5 h-5" />
        </button>
        <span className="text-sm text-somi-gray-500">
          {rating === 1 ? 'Not helpful' : rating === 5 ? 'Helpful' : 'Select to provide feedback'}
        </span>
        {rating && (
          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className={`p-2 rounded-lg transition-colors ${
              showTextInput
                ? 'bg-somi-purple-100 text-somi-purple-700'
                : 'hover:bg-gray-100 text-gray-600 hover:scale-105'
            }`}
            title="Add detailed feedback"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {showTextInput && (
        <form onSubmit={handleTextSubmit} className="space-y-2">
          <textarea
            autoFocus
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="What did you like or dislike about this activity? How could it be improved?"
            className="w-full p-4 border border-[#F3F5FF] rounded-lg resize-none focus:ring-2 focus:ring-somi-purple-400 focus:border-transparent bg-white/50 backdrop-blur-sm"
            rows={3}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !feedbackText.trim()}
              className="px-4 py-2 bg-somi-purple-600 text-white rounded-lg hover:bg-somi-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      )}
      {rating && !showTextInput && (
        <p className="text-sm text-somi-gray-500 italic">
          Click the message icon to add detailed feedback
        </p>
      )}
    </div>
  );
}