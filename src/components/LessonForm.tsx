import React from 'react';
import { Music2, Sparkles, Tag, FileMusic } from 'lucide-react';
import type { YearGroup } from '../types';

const yearGroups: YearGroup[] = ['Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
const topics = ['Rhythm', 'Pitch', 'Dynamics', 'Tempo', 'Timbre', 'Structure'];

interface Props {
  onSubmit: (data: {
    yearGroup: YearGroup;
    topic: string;
    keywords: string[];
    piece?: string;
  }) => void;
  isLoading: boolean;
}

export function LessonForm({ onSubmit, isLoading }: Props) {
  const [formData, setFormData] = React.useState({
    yearGroup: 'Year 1' as YearGroup,
    topic: '',
    keywords: [] as string[],
    piece: ''
  });

  const [keyword, setKeyword] = React.useState('');

  const addKeyword = () => {
    if (keyword && !formData.keywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
      setKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-md backdrop-blur-sm bg-white/80 p-8 rounded-2xl shadow-xl border border-somi-purple-100">
      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-3 text-somi-gray-700 mb-3 font-medium">
            <div className="p-2 bg-somi-purple-100 rounded-lg">
              <Music2 className="w-5 h-5 text-somi-purple-600" />
            </div>
            Year Group
          </label>
          <select
            value={formData.yearGroup}
            onChange={(e) => setFormData(prev => ({ ...prev, yearGroup: e.target.value as YearGroup }))}
            className="w-full p-4 border border-[#F3F5FF] rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-somi-purple-400 focus:border-transparent transition-all duration-200 hover:border-somi-purple-300"
          >
            {yearGroups.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-3 text-somi-gray-700 mb-3 font-medium">
            <div className="p-2 bg-somi-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-somi-purple-600" />
            </div>
            Topic
          </label>
          <select
            value={formData.topic}
            onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
            className="w-full p-4 border border-[#F3F5FF] rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-somi-purple-400 focus:border-transparent transition-all duration-200 hover:border-somi-purple-300"
            required
          >
            <option value="">Select a topic...</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-3 text-somi-gray-700 mb-3 font-medium">
            <div className="p-2 bg-somi-purple-100 rounded-lg">
              <Tag className="w-5 h-5 text-somi-purple-600" />
            </div>
            Keywords
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter keywords..."
                className="flex-1 p-4 border border-[#F3F5FF] rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-somi-purple-400 focus:border-transparent transition-all duration-200 hover:border-somi-purple-300"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-4 py-2 bg-somi-purple-100 text-somi-purple-600 rounded-xl hover:bg-somi-purple-200"
              >
                Add
              </button>
            </div>
            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-somi-purple-100 text-somi-purple-600 rounded-full flex items-center gap-2"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(i)}
                      className="w-4 h-4 rounded-full bg-somi-purple-200 text-somi-purple-700 flex items-center justify-center hover:bg-somi-purple-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3 text-somi-gray-700 mb-3 font-medium">
            <div className="p-2 bg-somi-purple-100 rounded-lg">
              <FileMusic className="w-5 h-5 text-somi-purple-600" />
            </div>
            Specific Piece (Optional)
          </label>
          <input
            type="text"
            value={formData.piece}
            onChange={(e) => setFormData(prev => ({ ...prev, piece: e.target.value }))}
            placeholder="e.g., Symphony No. 5"
            className="w-full p-4 border border-[#F3F5FF] rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-somi-purple-400 focus:border-transparent transition-all duration-200 hover:border-somi-purple-300"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !formData.topic}
        className="relative w-full bg-gradient-to-r from-somi-purple-600 to-somi-purple-700 text-white py-5 px-8 rounded-2xl font-semibold hover:from-somi-purple-700 hover:to-somi-purple-800 focus:outline-none focus:ring-2 focus:ring-somi-purple-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        {isLoading ? 'Generating Lesson...' : 'Generate Lesson'}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
    </form>
  );
}