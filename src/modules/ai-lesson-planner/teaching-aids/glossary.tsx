import React from 'react';

const MUSIC_TERMS = {
  'Solfa': 'A system for teaching pitch and sight singing using syllables (do, re, mi, etc.)',
  'Rhythm': 'The pattern of long and short sounds in music',
  'Pitch': 'How high or low a note sounds',
  'Dynamics': 'How loud or soft the music is',
  'Tempo': 'How fast or slow the music is',
  'Timbre': 'The unique sound quality or tone color of an instrument or voice',
  // Add more terms as needed
};

export function MusicGlossary() {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredTerms = Object.entries(MUSIC_TERMS).filter(([term]) =>
    term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Music Glossary</h3>
      <input
        type="search"
        placeholder="Search terms..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded-lg mb-4"
      />
      <div className="space-y-4">
        {filteredTerms.map(([term, definition]) => (
          <div key={term}>
            <dt className="font-medium text-somi-purple-700">{term}</dt>
            <dd className="text-somi-gray-600 ml-4">{definition}</dd>
          </div>
        ))}
      </div>
    </div>
  );
}