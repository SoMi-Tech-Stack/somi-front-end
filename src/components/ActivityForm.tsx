import React from 'react';
import { Music2, Sparkles, Zap, Bot } from 'lucide-react';
import type { FormData, YearGroup, EnergyLevel, LLMProvider } from '../types';

const yearGroups: YearGroup[] = ['Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
const energyLevels: EnergyLevel[] = ['Active', 'Reflective'];

interface Props {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export function ActivityForm({ onSubmit, isLoading }: Props) {
  const [formData, setFormData] = React.useState<FormData>({
    yearGroup: 'Year 1',
    theme: '',
    energyLevel: 'Active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-md backdrop-blur-sm bg-white/80 p-8 rounded-2xl shadow-xl border border-somi-purple-100">
      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-3 text-[#000040] mb-3 font-medium">
            <div className="p-2 bg-somi-purple-100 rounded-lg">
              <Music2 className="w-5 h-5 text-[#000040]" />
            </div>
            Year Group
          </label>
          <select
            value={formData.yearGroup}
            onChange={(e) => setFormData({ ...formData, yearGroup: e.target.value as YearGroup })}
            className="w-full p-4 border border-[#F3F5FF] rounded-xl bg-white text-[#000040] shadow-sm focus:ring-2 focus:ring-somi-purple-400 focus:border-transparent transition-all duration-200 hover:border-somi-purple-300 focus:outline-none focus-visible:outline-none"
          >
            {yearGroups.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-3 text-[#000040] mb-3 font-medium">
            <div className="p-2 bg-somi-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-[#000040]" />
            </div>
            Theme / Project
          </label>
          <input
            type="text"
            value={formData.theme}
            onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
            placeholder="e.g., Space, Animals, Weather"
            className="w-full p-4 border border-[#F3F5FF] rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-somi-purple-400 focus:border-transparent transition-all duration-200 hover:border-somi-purple-300 focus:outline-none focus-visible:outline-none text-[#000040]"
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-3 text-[#000040] mb-3 font-medium">
            <div className="p-2 bg-somi-purple-100 rounded-lg">
              <Zap className="w-5 h-5 text-[#000040]" />
            </div>
            Energy Level
          </label>
          <select
            value={formData.energyLevel}
            onChange={(e) => setFormData({ ...formData, energyLevel: e.target.value as EnergyLevel })}
            className="text-[#000040] w-full p-4 border border-[#F3F5FF] rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-somi-purple-400 focus:border-transparent transition-all duration-200 hover:border-somi-purple-300 focus:outline-none focus-visible:outline-none"
          >
            {energyLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="relative w-full bg-gradient-to-r from-[#4f00ff] to-[#e600cc] text-white py-5 px-8 rounded-full font-semibold hover:from-[#3c00d0] hover:to-[#cc00b8] focus:outline-none focus:ring-2 focus:ring-[#c54bff] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        {isLoading ? 'Generating Activity...' : 'Generate Activity'}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>

    </form>
  );
}