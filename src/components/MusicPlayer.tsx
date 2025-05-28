import React from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import * as Tone from 'tone';
import { Music2, Play, Pause, SkipBack, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface Props {
  xmlUrl: string;
  title: string;
  youtubeId?: string;
}

export function MusicPlayer({ xmlUrl, title, youtubeId }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const osmdRef = React.useRef<OpenSheetMusicDisplay | null>(null);
  const synthRef = React.useRef<Tone.PolySynth | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [currentMeasure, setCurrentMeasure] = React.useState(0);
  const [totalMeasures, setTotalMeasures] = React.useState(0);

  React.useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous instance if it exists
    if (osmdRef.current) {
      osmdRef.current.clear();
    }

    const osmd = new OpenSheetMusicDisplay(containerRef.current, {
      autoResize: true,
      drawTitle: true,
      drawSubtitle: true,
      drawComposer: true,
      drawMetronomeMarks: true,
      followCursor: true,
      disableCursor: false,
      drawingParameters: {
        defaultColorMusic: "#000000",
        defaultColorLabel: "#000000",
      }
    });

    // Initialize synthesizer
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synthRef.current = synth;
    osmdRef.current = osmd;

    const loadScore = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // If xmlUrl is already XML content, load it directly
        if (xmlUrl.startsWith('<?xml') || xmlUrl.startsWith('<score-partwise')) {
          await osmd.load(xmlUrl);
        } else {
          // Otherwise treat it as a URL and fetch
          const response = await fetch(xmlUrl);
          if (!response.ok) throw new Error('Failed to fetch score');
          const xmlData = await response.text();
          await osmd.load(xmlData);
        }

        await osmd.render();
        
        // Get total measures
        const measures = osmd.GraphicSheet?.measureList || [];
        setTotalMeasures(measures.length);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load music score:', err);
        setError('Failed to load the music score. Please try again later.');
        setIsLoading(false);
      }
    };

    loadScore();

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
      }
      if (osmdRef.current) {
        osmdRef.current.clear();
      }
    };
  }, [xmlUrl]);

  const playMeasure = async (measureIndex: number) => {
    if (!osmdRef.current || !synthRef.current) return;
    
    const osmd = osmdRef.current;
    const synth = synthRef.current;
    
    // Get the current measure
    const measures = osmd.GraphicSheet?.measureList || [];
    if (measureIndex >= measures.length) {
      setIsPlaying(false);
      setCurrentMeasure(0);
      osmd.cursor.reset();
      return;
    }
    
    const measure = measures[measureIndex];
    if (!measure) return;

    // Highlight current measure
    osmd.cursor.show();
    osmd.cursor.reset();
    for (let i = 0; i < measureIndex; i++) {
      osmd.cursor.next();
    }

    // Extract notes from the measure
    const notes = measure.flatMap(staff => 
      staff.Voices.flatMap(voice =>
        voice.Notes.map(note => ({
          pitch: note.Pitch?.ToString() || 'C4',
          duration: note.Duration.RealValue + 'n',
          time: note.AbsoluteTimestamp.RealValue
        }))
      )
    );

    // Play the notes
    const now = Tone.now();
    notes.forEach(note => {
      synth.triggerAttackRelease(
        note.pitch,
        note.duration,
        now + note.time
      );
    });

    // Schedule next measure
    // Calculate measure duration based on time signature and tempo
    const timeSignature = osmd.Sheet?.GetFirstSourceMeasure()?.TimeSignature;
    const tempo = osmd.Sheet?.DefaultStartTempoInBpm || 120;
    const measureDuration = timeSignature ? 
      (timeSignature.Numerator * 60) / (timeSignature.Denominator * tempo / 4) :
      2; // Fallback to 2 seconds if no time signature

    setTimeout(() => {
      if (isPlaying) {
        setCurrentMeasure(measureIndex + 1);
        playMeasure(measureIndex + 1);
      }
    }, measureDuration * 1000);
  };

  const togglePlayback = async () => {
    if (!osmdRef.current || !synthRef.current) return;
    
    if (!isPlaying) {
      setCurrentMeasure(0);
      await Tone.start();
      setIsPlaying(true);
      playMeasure(currentMeasure);
    } else {
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    setCurrentMeasure(0);
    setIsPlaying(false);
    if (osmdRef.current) {
      osmdRef.current.cursor.reset();
      osmdRef.current.cursor.hide();
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!osmdRef.current) return;
    
    const newZoom = direction === 'in' ? zoom * 1.2 : zoom / 1.2;
    setZoom(newZoom);
    
    osmdRef.current.Zoom = newZoom;
    osmdRef.current.render();
  };

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {youtubeId && (
        <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={`${title} - YouTube video player`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-somi-purple-50 to-white border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-somi-purple-100 rounded-lg">
                <Music2 className="w-5 h-5 text-somi-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-somi-gray-800">{title}</h3>
              <div className="text-sm text-somi-gray-500">
                Measure {currentMeasure + 1} of {totalMeasures}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="p-2 text-somi-gray-600 hover:text-somi-gray-800 transition-colors"
                disabled={isLoading}
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={togglePlayback}
                className={`p-2 rounded-lg ${
                  isPlaying
                    ? 'bg-somi-purple-100 text-somi-purple-700'
                    : 'bg-somi-purple-600 text-white'
                } hover:opacity-90 transition-colors`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => handleReset()}
                className="p-2 text-somi-gray-600 hover:text-somi-gray-800 transition-colors"
                disabled={isLoading}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-somi-gray-200 mx-2" />
              <button
                onClick={() => handleZoom('out')}
                className="p-2 text-somi-gray-600 hover:text-somi-gray-800 transition-colors"
                disabled={isLoading}
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleZoom('in')}
                className="p-2 text-somi-gray-600 hover:text-somi-gray-800 transition-colors"
                disabled={isLoading}
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div 
          ref={containerRef}
          className={`min-h-[450px] p-4 ${isLoading ? 'animate-pulse bg-[#F0F2FF]' : ''}`}
        />
      </div>
    </div>
  );
}