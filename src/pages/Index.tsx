import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';

// Web Audio API context
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const playNote = (frequency: number, duration: number = 0.2) => {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.value = frequency;
  osc.type = 'sine';

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
};

const playDrumSound = (type: string) => {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  if (type === 'kick') {
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } else if (type === 'snare') {
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    osc.frequency.value = 200;
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } else if (type === 'hihat') {
    filter.type = 'highpass';
    filter.frequency.value = 8000;
    osc.frequency.value = 300;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }
};

// Piano notes
const pianoNotes = [
  { note: 'C', freq: 262 },
  { note: 'D', freq: 294 },
  { note: 'E', freq: 330 },
  { note: 'F', freq: 349 },
  { note: 'G', freq: 392 },
  { note: 'A', freq: 440 },
  { note: 'B', freq: 494 },
  { note: 'C', freq: 523 },
];

const drumPads = [
  { name: 'Kick', type: 'kick', color: 'bg-red-600' },
  { name: 'Snare', type: 'snare', color: 'bg-blue-600' },
  { name: 'Hi-Hat', type: 'hihat', color: 'bg-yellow-600' },
  { name: 'Tom', type: 'kick', color: 'bg-purple-600' },
];

export default function MusicMaker() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeDrum, setActiveDrum] = useState<string | null>(null);
  const sequenceRef = useRef<number[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: { [key: string]: number } = {
        'z': 0, 'x': 1, 'c': 2, 'v': 3, 'b': 4, 'n': 5, 'm': 6, ',': 7,
      };

      if (keyMap[e.key] !== undefined) {
        e.preventDefault();
        const idx = keyMap[e.key];
        setActiveKey(pianoNotes[idx].note + idx);
        playNote(pianoNotes[idx].freq);
      }
    };

    const handleKeyUp = () => {
      setActiveKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handlePlaySequence = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-2">
            🎵 Music Maker
          </h1>
          <p className="text-gray-400 text-lg">Create beautiful melodies with your keyboard</p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={handlePlaySequence}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            {isPlaying ? 'Stop' : 'Play'}
          </button>
          <button
            onClick={() => sequenceRef.current = []}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600 text-white transition-all"
          >
            <RotateCcw size={20} />
            Clear
          </button>
          <div className="flex items-center gap-3 px-6 py-3 bg-gray-800 rounded-lg">
            <Volume2 size={20} className="text-purple-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="w-24 cursor-pointer"
            />
            <span className="text-sm text-gray-400 w-8">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Piano */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-8 shadow-2xl border border-purple-500/20">
            <h2 className="text-2xl font-bold text-purple-400 mb-6">Piano</h2>
            <p className="text-gray-400 text-sm mb-4">Press Z-X-C-V-B-N-M-,</p>
            <div className="flex gap-1 justify-center flex-wrap">
              {pianoNotes.map((note, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveKey(note.note + idx);
                    playNote(note.freq);
                    setTimeout(() => setActiveKey(null), 200);
                  }}
                  className={`w-12 h-24 rounded-lg font-bold transition-all transform ${
                    activeKey === note.note + idx
                      ? 'bg-purple-500 scale-95 shadow-lg shadow-purple-500'
                      : 'bg-gradient-to-b from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 shadow-lg'
                  } text-white`}
                >
                  {note.note}
                </button>
              ))}
            </div>
          </div>

          {/* Drum Pads */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-8 shadow-2xl border border-blue-500/20">
            <h2 className="text-2xl font-bold text-blue-400 mb-6">Drums</h2>
            <p className="text-gray-400 text-sm mb-4">Click to play drum sounds</p>
            <div className="grid grid-cols-2 gap-4">
              {drumPads.map((pad, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveDrum(pad.type);
                    playDrumSound(pad.type);
                    setTimeout(() => setActiveDrum(null), 150);
                  }}
                  className={`h-24 rounded-lg font-bold transition-all transform ${
                    activeDrum === pad.type
                      ? `${pad.color} scale-95 shadow-lg`
                      : `${pad.color} hover:brightness-110 shadow-lg`
                  } text-white text-sm`}
                >
                  {pad.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="mt-8 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-8 shadow-2xl border border-green-500/20">
          <h2 className="text-2xl font-bold text-green-400 mb-4">Visualizer</h2>
          <div className="flex items-end justify-center gap-1 h-32 bg-black/30 rounded-lg p-4">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-green-500 to-green-300 rounded-t opacity-70 transition-all"
                style={{
                  height: `${Math.random() * 100}%`,
                  animation: 'pulse 0.3s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>💡 Tip: Use your keyboard for piano notes, or click buttons for drums</p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
