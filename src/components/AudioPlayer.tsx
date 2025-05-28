import React from 'react';
import { Play, Pause, SkipBack, Volume2, VolumeX } from 'lucide-react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  audioUrl: string;
  title: string;
}

export function AudioPlayer({ audioUrl, title }: Props) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(0.8);
  const [isMuted, setIsMuted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const playerRef = React.useRef<Tone.Player | null>(null);
  const analyzerRef = React.useRef<Tone.Analyser | null>(null);
  const rafRef = React.useRef<number>();
  const progressInterval = React.useRef<number>();

  React.useEffect(() => {
    const setupAudio = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize Tone.js
        await Tone.start();
        
        // Create player and analyzer
        const player = new Tone.Player({
          url: audioUrl,
          onload: () => {
            setIsLoading(false);
            setDuration(player.buffer.duration);
          },
          onerror: (error) => {
            console.error('Audio loading error:', error);
            setError('Failed to load audio');
            setIsLoading(false);
          }
        }).toDestination();

        const analyzer = new Tone.Analyser('waveform', 1024);
        player.connect(analyzer);

        playerRef.current = player;
        analyzerRef.current = analyzer;

        return () => {
          player.dispose();
          analyzer.dispose();
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          if (progressInterval.current) clearInterval(progressInterval.current);
        };
      } catch (error) {
        console.error('Audio setup error:', error);
        setError('Failed to initialize audio player');
        setIsLoading(false);
      }
    };

    setupAudio();
  }, [audioUrl]);

  const drawWaveform = React.useCallback(() => {
    const canvas = canvasRef.current;
    const analyzer = analyzerRef.current;
    
    if (!canvas || !analyzer) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = analyzer.getValue() as Float32Array;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = isPlaying ? '#6B4E71' : '#8B6D99';
    ctx.lineWidth = 2;
    
    const sliceWidth = width / data.length;
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      const v = data[i] * 0.5;
      const y = (v * height) + (height / 2);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw progress bar
    const progressWidth = width * progress;
    ctx.fillStyle = 'rgba(107, 78, 113, 0.2)';
    ctx.fillRect(0, 0, progressWidth, height);

    rafRef.current = requestAnimationFrame(drawWaveform);
  }, [isPlaying, progress]);

  React.useEffect(() => {
    if (isPlaying) {
      drawWaveform();
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, [isPlaying, drawWaveform]);

  const togglePlayback = async () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.stop();
      if (progressInterval.current) clearInterval(progressInterval.current);
    } else {
      await playerRef.current.start();
      progressInterval.current = window.setInterval(() => {
        if (playerRef.current) {
          setProgress(playerRef.current.currentTime / duration);
        }
      }, 50);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    if (!playerRef.current) return;
    playerRef.current.stop();
    setProgress(0);
    setIsPlaying(false);
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.volume.value = Tone.gainToDb(volume);
    } else {
      playerRef.current.volume.value = -Infinity;
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.volume.value = Tone.gainToDb(newVolume);
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-somi-purple-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-somi-gray-800">{title}</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 text-somi-gray-600 hover:text-somi-gray-800 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-somi-purple-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-somi-purple-600"
              />
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
            </div>
          </div>
        </div>
        
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={100}
            className="w-full h-24 rounded-lg bg-white/50"
          />
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg"
              >
                <div className="text-somi-purple-600">Loading audio...</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-2 text-sm text-somi-gray-600">
          <span>{formatTime(progress * duration)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}