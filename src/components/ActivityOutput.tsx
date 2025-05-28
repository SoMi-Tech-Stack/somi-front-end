import React from 'react';
import { Copy, RefreshCw, Music2, FileText, BookOpen } from 'lucide-react';
import { FeedbackButtons } from './FeedbackButtons';
import { LessonFeedback } from './LessonFeedback';
import type { ActivityResponse } from '../types';

interface Props {
  activity: ActivityResponse;
  isLoading: boolean;
  onRegenerate: () => void;
  analyticsId?: string;
  yearGroup: string;
  theme: string;
  energyLevel: string;
}

export function ActivityOutput({ activity, isLoading, onRegenerate, analyticsId, yearGroup, theme, energyLevel }: Props) {
  const videoId = activity.youtubeVideo.url ? 
    new URLSearchParams(new URL(activity.youtubeVideo.url).search).get('v') : null;

  const copyToClipboard = () => {
    const text = `
${activity.piece.title} by ${activity.piece.composer}
${activity.piece.youtubeLink ? `\nYouTube Link: ${activity.piece.youtubeLink}` : ''}

Why this piece?
${activity.reason}

Discussion Questions:
${activity.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Teacher Tip:
${activity.teacherTip}
    `.trim();

    navigator.clipboard.writeText(text);
  };

  return (
    <div className='bg-white p-8 rounded-2xl shadow-lg border border-[#F3F5FF] space-y-8'>
    <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
  <div className="space-y-2">
    <h1 className="text-4xl font-bold text-[#0a014f]">
      {activity.piece.title}
      <span className="text-lg font-normal text-[#0a014f] ml-4">By {activity.piece.composer}</span>
    </h1>
    <div className="flex flex-wrap gap-2">
      <span className="px-3 py-1 rounded-full bg-[#F0F2FF] text-sm font-medium text-[#0a014f] border border-[#F3F5FF]">
        {yearGroup}
      </span>
      <span className="px-3 py-1 rounded-full bg-[#F0F2FF] text-sm font-medium text-[#0a014f] border border-[#F3F5FF]">
        {theme}
      </span>
      <span className="px-3 py-1 rounded-full bg-[#F0F2FF] text-sm font-medium text-[#0a014f] border border-[#F3F5FF]">
        {energyLevel}
      </span>
    </div>
  </div>
  <div className="flex gap-3">
<button
  onClick={onRegenerate}
  disabled={isLoading}
  className="flex items-center justify-center gap-2 px-4 py-2 text-[#0a014f] bg-[#F0F2FF] hover:bg-somi-purple-100 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
>
    {isLoading ? (
      <>
        <svg
          className="animate-spin h-4 w-4 text-somi-purple-700"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
          ></path>
        </svg>
        <span>Regenerating...</span>
      </>
    ) : (
      <>
        <RefreshCw className="w-4 h-4" />
        Regenerate
      </>
    )}
    </button>
    <button
      onClick={copyToClipboard}
      className="flex items-center gap-2 px-4 py-2 text-[#0a014f] bg-[#F0F2FF] hover:bg-somi-gray-100 rounded-full text-sm"
    >
      <Copy className="w-4 h-4" />
      Copy
    </button>
  </div>
</div>

{/* Content Block */}
<div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-0">
  {/* Left: About */}
  <div className="w-full lg:w-[55%] bg-white p-6 rounded-2xl border-2 border-[#F3F5FF] space-y-4 flex flex-col justify-between">
    <h3 className="text-lg font-semibold text-[#000040] flex items-center gap-2">
      <Music2 className="w-5 h-5 text-[#000040]" />
      About the Music
    </h3>
    <div className="space-y-2">
      {activity.piece.details.yearComposed && (
        <div className='flex flex-col sm:flex-row justify-between items-center gap-2'>
          <div>
            <span className="text-sm text-[#000040]">Year Composed:</span>
          <p className="text-[#000040]">{activity.piece.details.yearComposed}</p>
          </div>

        {activity.piece.details.sheetMusicUrl && (
          <a
            href={activity.piece.details.sheetMusicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm px-3 py-2 bg-[#F0F2FF] border border-[#F3F5FF] rounded-full text-[#000040]hover:bg-somi-gray-100"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Sheet Music
          </a>
        )}
        </div>
      )}
      <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap">
        {activity.piece.details.wikipediaUrl && (
          <a
            href={activity.piece.details.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-[#000040] hover:underline"
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Learn more from Wikipedia
          </a>
        )}
      </div>
      {activity.piece.details.about && (
        <div>
          <span className="text-sm text-[#000040]">About:</span>
          <p className="text-[#000040] whitespace-pre-line">
            {activity.piece.details.about}
          </p>
        </div>
      )}
    </div>
  </div>

  {/* Right: YouTube */}
  <div className="w-full lg:w-[65%] rounded-2xl overflow-hidden flex">
    {videoId && (
      <iframe
        className="w-full rounded-2xl shadow aspect-video lg:h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={activity.piece.title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    )}
  </div>
</div>

{/* Why this piece + Teacher Tip (Adjusted Widths) */}
<div className="mt-12 flex flex-col lg:flex-row gap-6">
  <div className="w-full lg:w-[55%] bg-[#FFFFFF] border-2 border-[#F3F5FF] p-6 rounded-2xl space-y-3">
    <h3 className="text-lg font-semibold text-[#000040] flex items-center gap-2">
      <span className="inline-block p-2 bg-somi-purple-100 rounded-lg">
        <Music2 className="w-5 h-5 text-[#000040]" />
      </span>
      Why this piece?
    </h3>
    <p className="text-[#000040] whitespace-pre-line">{activity.reason}</p>
  </div>
  <div className="w-full lg:w-[65%] bg-[#FFFFFF] border-2 border-[#F3F5FF] p-6 rounded-2xl space-y-3">
    <h3 className="text-lg font-semibold text-[#000040] flex items-center gap-2">
      <span className="inline-block p-2 bg-somi-purple-100 rounded-lg">
        <Music2 className="w-5 h-5 text-[#000040]" />
      </span>
      Teacher Tip
    </h3>
    <p className="text-[#000040] whitespace-pre-line">{activity.teacherTip}</p>
  </div>
</div>

{/* Discussion Questions */}
<div className="mt-12 p-6 bg-[#F0F2FF] rounded-2xl space-y-6">
  <h3 className="text-lg font-semibold text-[#000040] flex items-center gap-2">
    <span className="inline-block p-2 bg-somi-purple-100 rounded-lg">
      <Music2 className="w-5 h-5 text-[#000040]" />
    </span>
    Discussion Questions
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {activity.questions.map((question, index) => (
      <div key={index} className="bg-white rounded-xl px-4 py-3 text-[#000040]">
        <span className="font-semibold mr-2">{index + 1}.</span>
        {question}
      </div>
    ))}
  </div>
</div>

{/* Feedback Section */}
<div className="mt-12 border-t-2 pt-8 border-[#F3F5FF]">
    <div className="flex gap-3">
    <button
      onClick={onRegenerate}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 px-4 py-2 text-[#000040] bg-[#F0F2FF] hover:bg-somi-purple-100 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-[#000040]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
            ></path>
          </svg>
          <span>Regenerating...</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </>
      )}
    </button>
    <button
      onClick={copyToClipboard}
      className="flex items-center gap-2 px-4 py-2 text-[#000040] bg-[#F0F2FF] hover:bg-somi-gray-100 rounded-full text-sm"
    >
      <Copy className="w-4 h-4" />
      Copy
    </button>
  </div>
  {analyticsId && (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-[#000040] mb-4">Was this lesson useful?</h3>
      <FeedbackButtons activity={activity} />
    </div>
  )}
  <div>
    <LessonFeedback activity={activity} theme={theme} yearGroup={yearGroup} />
  </div>
</div>

</div>
  );
}