import React from 'react';
import * as Tone from 'tone';
import { SOLFA_COLORS } from '../types';

interface SolfaPianoProps {
  octave?: number;
  showLabels?: boolean;
}

export function SolfaPiano({ octave = 4, showLabels = true }: SolfaPianoProps) {
  const [synth] = React.useState(() => new Tone.Synth().toDestination());
  
  const playNote = (note: string) => {
    synth.triggerAttackRelease(`${note}${octave}`, '8n');
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Solfa Piano</h3>
      <div className="flex gap-2">
        {SOLFA_COLORS.map(({ note, color, label }) => (
          <button
            key={note}
            onClick={() => playNote(note)}
            className="w-12 h-32 rounded-b-lg transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: color }}
          >
            {showLabels && (
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white font-bold">
                {note}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}