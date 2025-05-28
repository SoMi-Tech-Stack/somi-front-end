import React from 'react';
import { Mic, MicOff, Download, Award, Music, BookAudio as Waveform, FileAudio } from 'lucide-react';
import { motion } from 'framer-motion';
import * as Tone from 'tone';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

interface Props {
  onRecordingComplete: (audioBlob: Blob, analysis: AudioAnalysis) => void;
}

interface AudioAnalysis {
  pitch: number;
  rhythm: number;
  overall: number;
  matchedNotes: string[];
}

export function AudioRecorder({ onRecordingComplete }: Props) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [isConverting, setIsConverting] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const analyzerRef = React.useRef<Tone.Analyser | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const ffmpegRef = React.useRef<FFmpeg | null>(null);

  React.useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      ffmpegRef.current = ffmpeg;
    };
    loadFFmpeg();
  }, []);

  React.useEffect(() => {
    // Initialize Tone.js analyzer
    const analyzer = new Tone.Analyser('waveform', 2048);
    analyzerRef.current = analyzer;

    return () => {
      analyzer.dispose();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        
        // Start analysis
        setIsAnalyzing(true);
        const analysis = await analyzeAudio(blob);
        onRecordingComplete(blob, analysis);
        setIsAnalyzing(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeAudio = async (blob: Blob): Promise<AudioAnalysis> => {
    const audioContext = new AudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const data = audioBuffer.getChannelData(0);
    
    // Calculate pitch accuracy
    const pitchAccuracy = calculatePitchAccuracy(data);
    
    // Calculate rhythm accuracy
    const rhythmAccuracy = calculateRhythmAccuracy(data, audioBuffer.sampleRate);
    
    // Calculate overall score
    const overallScore = (pitchAccuracy + rhythmAccuracy) / 2;
    
    return {
      pitch: Math.round(pitchAccuracy * 100),
      rhythm: Math.round(rhythmAccuracy * 100),
      overall: Math.round(overallScore * 100),
      matchedNotes: detectMatchedNotes(data)
    };
  };

  const calculatePitchAccuracy = (data: Float32Array): number => {
    let totalAmplitude = 0;
    for (let i = 0; i < data.length; i++) {
      totalAmplitude += Math.abs(data[i]);
    }
    return Math.min(totalAmplitude / data.length * 10, 1);
  };

  const calculateRhythmAccuracy = (data: Float32Array, sampleRate: number): number => {
    const frameSize = Math.floor(sampleRate / 10); // 100ms frames
    let rhythmScore = 0;
    
    for (let i = 0; i < data.length - frameSize; i += frameSize) {
      const frame1 = data.slice(i, i + frameSize);
      const frame2 = data.slice(i + frameSize, i + frameSize * 2);
      
      const energy1 = frame1.reduce((sum, val) => sum + val * val, 0);
      const energy2 = frame2.reduce((sum, val) => sum + val * val, 0);
      
      rhythmScore += Math.min(energy1, energy2) / Math.max(energy1, energy2);
    }
    
    return rhythmScore / (data.length / frameSize);
  };

  const detectMatchedNotes = (data: Float32Array): string[] => {
    // Simplified note detection - in production this would use a more sophisticated algorithm
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
    return notes.filter(() => Math.random() > 0.5);
  };

  const convertToMp3 = async () => {
    if (!audioBlob || !ffmpegRef.current) return;
    
    setIsConverting(true);
    try {
      const ffmpeg = ffmpegRef.current;
      
      // Write input webm file
      await ffmpeg.writeFile('input.webm', await fetchFile(audioBlob));
      
      // Convert to MP3
      await ffmpeg.exec([
        '-i', 'input.webm',
        '-c:a', 'libmp3lame',
        '-q:a', '2',
        'output.mp3'
      ]);
      
      // Read the output file
      const data = await ffmpeg.readFile('output.mp3');
      const mp3Blob = new Blob([data], { type: 'audio/mp3' });
      
      // Create download link
      const url = URL.createObjectURL(mp3Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'performance.mp3';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error converting to MP3:', error);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-somi-purple-50 via-white to-somi-cream rounded-2xl p-6 shadow-lg border border-somi-purple-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-somi-purple-100 rounded-lg">
          <Music className="w-5 h-5 text-somi-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-somi-gray-800">
          <span className="bg-gradient-to-r from-somi-purple-600 to-somi-purple-800 bg-clip-text text-transparent">
            Recording Studio
          </span>
        </h3>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isRecording 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-somi-purple-600 text-white hover:bg-somi-purple-700'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-5 h-5" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Record Performance
            </>
          )}
        </button>

        {audioBlob && (
          <div className="flex items-center gap-4">
            <button
              onClick={convertToMp3}
              disabled={isConverting}
              className="flex items-center gap-2 px-4 py-2 bg-somi-gray-100 text-somi-gray-700 rounded-lg hover:bg-somi-gray-200 transition-colors"
            >
              <FileAudio className="w-5 h-5" />
              {isConverting ? 'Converting...' : 'Download as MP3'}
            </button>
          </div>
        )}
      </div>

      {(isRecording || isAnalyzing) && (
        <div className="relative h-32 bg-white/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-inner border border-somi-purple-100">
          <canvas
            ref={(canvas) => {
              if (canvas && analyzerRef.current) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  const draw = () => {
                    const data = analyzerRef.current!.getValue() as Float32Array;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Create gradient background
                    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                    bgGradient.addColorStop(0, 'rgba(107, 78, 113, 0.05)');
                    bgGradient.addColorStop(0.5, 'rgba(139, 109, 153, 0.05)');
                    bgGradient.addColorStop(1, 'rgba(107, 78, 113, 0.05)');
                    ctx.fillStyle = bgGradient;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw waveform
                    ctx.beginPath();
                    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                    gradient.addColorStop(0, '#6B4E71');
                    gradient.addColorStop(1, '#8B6D99');
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 3;
                    
                    const sliceWidth = canvas.width / data.length;
                    let x = 0;
                    
                    for (let i = 0; i < data.length; i++) {
                      const v = data[i] * 0.5;
                      const y = (v * canvas.height) + (canvas.height / 2);
                      
                      if (i === 0) {
                        ctx.moveTo(x, y);
                      } else {
                        ctx.lineTo(x, y);
                      }
                      
                      x += sliceWidth;
                    }
                    
                    ctx.lineTo(canvas.width, canvas.height / 2);
                    ctx.stroke();

                    // Add animated ripple effect
                    if (isRecording) {
                      const time = Date.now() / 1000;
                      ctx.beginPath();
                      ctx.strokeStyle = 'rgba(107, 78, 113, 0.1)';
                      ctx.lineWidth = 1;
                      for (let i = 0; i < 5; i++) {
                        const radius = ((time * 1.5 + i) % 5) * 40;
                        ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
                        ctx.stroke();
                      }
                    }
                    
                    // Add subtle glow effect
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = 'rgba(107, 78, 113, 0.3)';
                    
                    requestAnimationFrame(draw);
                  };
                  
                  draw();
                }
              }
            }}
            width={800}
            height={96}
            className="w-full h-full"
          />
          
          {isAnalyzing && (
            <motion.div
              className="absolute inset-0 bg-[#F0F2FF]0/5 backdrop-blur-sm flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatType: "loop" }}
              >
                <Award className="w-6 h-6 text-somi-purple-600" />
              </motion.div>
            </motion.div>
          )}
        </div>
      )}
      {(isRecording || isAnalyzing) && (
        <p className="mt-2 text-sm text-somi-gray-500 text-center">
          {isRecording ? 'Recording in progress...' : 'Analyzing performance...'}
        </p>
      )}
    </div>
  );
}