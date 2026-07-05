import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Bookmark, 
  Eye, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  Calendar, 
  RefreshCw, 
  Wind, 
  Sliders, 
  ListFilter, 
  CheckCircle, 
  FileText, 
  Lightbulb, 
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { JournalEntry, PhilosophicalEntry, BookWisdomEntry, IntuitionEntry } from '../types';

interface LogsAndBrainProps {
  journalEntries: Record<string, JournalEntry>;
  addJournalEntry: (entry: JournalEntry) => void;
  philosophicalEntries: PhilosophicalEntry[];
  setPhilosophicalEntries: React.Dispatch<React.SetStateAction<PhilosophicalEntry[]>>;
  bookWisdomEntries: BookWisdomEntry[];
  setBookWisdomEntries: React.Dispatch<React.SetStateAction<BookWisdomEntry[]>>;
  intuitionEntries: IntuitionEntry[];
  setIntuitionEntries: React.Dispatch<React.SetStateAction<IntuitionEntry[]>>;
}

type PillarType = 'philosophy' | 'books' | 'intuition' | 'meditation';

export default function LogsAndBrain({
  journalEntries,
  addJournalEntry,
  philosophicalEntries,
  setPhilosophicalEntries,
  bookWisdomEntries,
  setBookWisdomEntries,
  intuitionEntries,
  setIntuitionEntries
}: LogsAndBrainProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Active top-level pillar tab
  const [activePillar, setActivePillar] = useState<PillarType>('philosophy');

  // --- 1. PHILOSOPHICAL IDEAS STATE & HANDLERS ---
  const [philTitle, setPhilTitle] = useState('');
  const [philReflection, setPhilReflection] = useState('');
  const [philLinkedDate, setPhilLinkedDate] = useState(todayStr);

  const handleAddPhilosophy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!philTitle.trim() || !philReflection.trim()) return;

    const newEntry: PhilosophicalEntry = {
      id: `p-${Date.now()}`,
      title: philTitle.trim(),
      reflection: philReflection.trim(),
      timestamp: new Date().toISOString(),
      date: todayStr,
      linkedDate: philLinkedDate || todayStr
    };

    setPhilosophicalEntries(prev => [newEntry, ...prev]);
    setPhilTitle('');
    setPhilReflection('');
    setPhilLinkedDate(todayStr);
  };

  const handleDeletePhilosophy = (id: string) => {
    setPhilosophicalEntries(prev => prev.filter(item => item.id !== id));
  };


  // --- 2. BOOK WISDOM STATE & HANDLERS ---
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookSummary, setBookSummary] = useState('');
  const [bookLearningsText, setBookLearningsText] = useState('');
  const [bookLinkedDate, setBookLinkedDate] = useState(todayStr);

  const handleAddBookWisdom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim() || !bookSummary.trim()) return;

    const learningsArray = bookLearningsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const newBook: BookWisdomEntry = {
      id: `b-${Date.now()}`,
      title: bookTitle.trim(),
      author: bookAuthor.trim() || 'Unknown Author',
      summary: bookSummary.trim(),
      learnings: learningsArray.length > 0 ? learningsArray : ['Extracted key insights from book.'],
      date: todayStr,
      linkedDate: bookLinkedDate || todayStr
    };

    setBookWisdomEntries(prev => [newBook, ...prev]);
    setBookTitle('');
    setBookAuthor('');
    setBookSummary('');
    setBookLearningsText('');
    setBookLinkedDate(todayStr);
  };

  const handleDeleteBookWisdom = (id: string) => {
    setBookWisdomEntries(prev => prev.filter(b => b.id !== id));
  };


  // --- 3. INTUITION TRAINING STATE & HANDLERS ---
  const [decision, setDecision] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [decisionLinkedDate, setDecisionLinkedDate] = useState(todayStr);
  
  // Pending vs Resolved filter
  const [intuitionFilter, setIntuitionFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  // Outcome edit states
  const [editingIntuitionId, setEditingIntuitionId] = useState<string | null>(null);
  const [tempOutcome, setTempOutcome] = useState('');

  const handleAddIntuition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision.trim() || !reasoning.trim()) return;

    const newIntuition: IntuitionEntry = {
      id: `i-${Date.now()}`,
      decision: decision.trim(),
      reasoning: reasoning.trim(),
      outcome: '',
      date: todayStr,
      linkedDate: decisionLinkedDate || todayStr,
      status: 'pending'
    };

    setIntuitionEntries(prev => [newIntuition, ...prev]);
    setDecision('');
    setReasoning('');
    setDecisionLinkedDate(todayStr);
  };

  const handleResolveIntuition = (id: string) => {
    if (!tempOutcome.trim()) return;
    setIntuitionEntries(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          outcome: tempOutcome.trim(),
          status: 'resolved'
        };
      }
      return item;
    }));
    setEditingIntuitionId(null);
    setTempOutcome('');
  };

  const handleDeleteIntuition = (id: string) => {
    setIntuitionEntries(prev => prev.filter(item => item.id !== id));
  };


  // --- 4. MEDITATION & STILLNESS STATE & AUDIO ---
  // A. Box Breathing Tool
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<0 | 1 | 2 | 3>(0); // 0: Inhale, 1: Hold (Full), 2: Exhale, 3: Hold (Empty)
  const [breathCountdown, setBreathCountdown] = useState(4);
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const phaseDetails = [
    { label: 'Inhale Deeply', sub: 'Fill your lungs with crisp life energy', color: 'text-cyan-500 border-cyan-500 shadow-cyan-500/25', scale: 1.6 },
    { label: 'Hold Breath', sub: 'Retain the clarity and stay absolute', color: 'text-purple-500 border-purple-500 shadow-purple-500/25', scale: 1.6 },
    { label: 'Exhale Slow', sub: 'Release all tension and cognitive noise', color: 'text-emerald-500 border-emerald-500 shadow-emerald-500/25', scale: 1.0 },
    { label: 'Hold Empty', sub: 'Abide in primordial silence and stillness', color: 'text-amber-500 border-amber-500 shadow-amber-500/25', scale: 1.0 }
  ];

  useEffect(() => {
    if (isBreathing) {
      setBreathCountdown(4);
      setBreathingPhase(0);

      breathingIntervalRef.current = setInterval(() => {
        setBreathCountdown(prev => {
          if (prev <= 1) {
            setBreathingPhase(currPhase => ((currPhase + 1) % 4) as any);
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
      setBreathCountdown(4);
      setBreathingPhase(0);
    }

    return () => {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    };
  }, [isBreathing]);

  // B. Soundscape Player (Web Audio API Synthesizer)
  const [soundType, setSoundType] = useState<'binaural' | 'hum' | 'drone' | 'waves'>('binaural');
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [volume, setVolume] = useState(40); // 0-100

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const synthNodesRef = useRef<any[]>([]); // To hold oscillators, gains, filters to stop them later
  const lfoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    if (!masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    // Update volume
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume / 100;
    }
  };

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  const stopActiveSynthesizer = () => {
    if (lfoIntervalRef.current) {
      clearInterval(lfoIntervalRef.current);
      lfoIntervalRef.current = null;
    }
    synthNodesRef.current.forEach(node => {
      try {
        node.stop();
      } catch (e) {}
      try {
        node.disconnect();
      } catch (e) {}
    });
    synthNodesRef.current = [];
  };

  const startSynthesizer = () => {
    initAudio();
    stopActiveSynthesizer();
    
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    if (soundType === 'binaural') {
      // Create Stereo Panner or dual channels
      // Left channel: 110Hz
      const oscL = ctx.createOscillator();
      const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      oscL.type = 'sine';
      oscL.frequency.value = 110;

      // Right channel: 115.5Hz (5.5Hz Theta difference)
      const oscR = ctx.createOscillator();
      const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      oscR.type = 'sine';
      oscR.frequency.value = 115.5;

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.5;

      if (pannerL && pannerR) {
        pannerL.pan.value = -1;
        pannerR.pan.value = 1;
        oscL.connect(pannerL);
        pannerL.connect(oscGain);
        oscR.connect(pannerR);
        pannerR.connect(oscGain);
      } else {
        oscL.connect(oscGain);
        oscR.connect(oscGain);
      }

      oscGain.connect(masterGain);
      oscL.start();
      oscR.start();

      synthNodesRef.current = [oscL, oscR, oscGain];

    } else if (soundType === 'hum') {
      // Sub bass 55Hz and harmonic 110Hz + lowpass filter
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 55;

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = 110;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 120;

      const gain = ctx.createGain();
      gain.gain.value = 0.6;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc1.start();
      osc2.start();

      synthNodesRef.current = [osc1, osc2, filter, gain];

    } else if (soundType === 'drone') {
      // Evolving cosmic drone
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 80;

      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.value = 80.5;

      const osc3 = ctx.createOscillator();
      osc3.type = 'triangle';
      osc3.frequency.value = 161;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 150;
      filter.Q.value = 3;

      const filterGain = ctx.createGain();
      filterGain.gain.value = 0.4;

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(filterGain);
      filterGain.connect(masterGain);

      osc1.start();
      osc2.start();
      osc3.start();

      synthNodesRef.current = [osc1, osc2, osc3, filter, filterGain];

      // Slow manual LFO to sweep cutoff frequency
      let direction = 1;
      let currentFreq = 150;
      lfoIntervalRef.current = setInterval(() => {
        currentFreq += direction * 2;
        if (currentFreq >= 280) direction = -1;
        if (currentFreq <= 100) direction = 1;
        try {
          filter.frequency.value = currentFreq;
        } catch (e) {}
      }, 50);

    } else if (soundType === 'waves') {
      // Noise buffer wave generator
      const bufferSize = ctx.sampleRate * 4; // 4 seconds of noise
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // white noise
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      filter.Q.value = 1.0;

      const gain = ctx.createGain();
      gain.gain.value = 0.25;

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      noiseNode.start();

      synthNodesRef.current = [noiseNode, filter, gain];

      // Very slow ocean waves modulation
      let phaseValue = 0;
      lfoIntervalRef.current = setInterval(() => {
        phaseValue += 0.04;
        const sineMod = Math.sin(phaseValue); // -1 to 1
        const waveGain = 0.15 + (sineMod + 1) * 0.15; // 0.15 to 0.45
        const waveCutoff = 250 + (sineMod + 1) * 350; // 250 to 950 Hz
        try {
          gain.gain.value = waveGain;
          filter.frequency.setValueAtTime(waveCutoff, ctx.currentTime);
        } catch (e) {}
      }, 60);
    }
  };

  useEffect(() => {
    if (isSoundPlaying) {
      startSynthesizer();
    } else {
      stopActiveSynthesizer();
    }
    return () => stopActiveSynthesizer();
  }, [isSoundPlaying, soundType]);

  const toggleSound = () => {
    if (!isSoundPlaying) {
      initAudio();
      setIsSoundPlaying(true);
    } else {
      setIsSoundPlaying(false);
    }
  };

  // Filtered Intuition entries based on filter state
  const filteredIntuitions = intuitionEntries.filter(item => {
    if (intuitionFilter === 'all') return true;
    return item.status === intuitionFilter;
  });

  return (
    <div className="space-y-6" id="growth-ledger-dashboard">
      
      {/* Title & Slogan Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 dark:border-slate-800/80 pb-5 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-white uppercase">
            Growth Ledger <span className="text-purple-600 dark:text-purple-400">Pillars</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
            OPTIMIZE WORLDVIEW, SYSTEMIZE WISDOM, DOCUMENT GUT DECISIONS & EMBRACE PRIMORDIAL CALM.
          </p>
        </div>
      </div>

      {/* Top level High-contrast Tab System */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-100 dark:bg-slate-950/40 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80" id="ledger-pillar-nav">
        <button
          onClick={() => setActivePillar('philosophy')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer border ${
            activePillar === 'philosophy'
              ? 'bg-purple-600 text-white border-purple-600 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/40 shadow'
              : 'bg-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border-transparent'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>PHILOSOPHY</span>
        </button>

        <button
          onClick={() => setActivePillar('books')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer border ${
            activePillar === 'books'
              ? 'bg-pink-600 text-white border-pink-600 dark:bg-pink-500/15 dark:text-pink-400 dark:border-pink-500/40 shadow'
              : 'bg-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border-transparent'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>BOOK WISDOM</span>
        </button>

        <button
          onClick={() => setActivePillar('intuition')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer border ${
            activePillar === 'intuition'
              ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/40 shadow'
              : 'bg-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border-transparent'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>INTUITION</span>
        </button>

        <button
          onClick={() => setActivePillar('meditation')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer border ${
            activePillar === 'meditation'
              ? 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/40 shadow'
              : 'bg-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border-transparent'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>STILLNESS</span>
        </button>
      </div>

      {/* PILLAR 1: PHILOSOPHICAL IDEAS */}
      {activePillar === 'philosophy' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left" id="pillar-philosophy-pane">
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-500" /> Capture Reflection
              </h3>
              <form onSubmit={handleAddPhilosophy} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block mb-1">Concept or Worldview Title</label>
                  <input
                    type="text"
                    value={philTitle}
                    onChange={(e) => setPhilTitle(e.target.value)}
                    placeholder="e.g. Amor Fati / Epictetus principles"
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block mb-1">Deep Reflection & Synthesis</label>
                  <textarea
                    value={philReflection}
                    onChange={(e) => setPhilReflection(e.target.value)}
                    placeholder="Capture the absolute worldview parameters and foundational wisdom..."
                    rows={6}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-purple-500 outline-none resize-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" /> Link to Calendar Date
                  </label>
                  <input
                    type="date"
                    value={philLinkedDate}
                    onChange={(e) => setPhilLinkedDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Commit Worldview Log
                </button>
              </form>
            </div>
          </div>

          {/* List Readout Side */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Stored Philosophical Matrix ({philosophicalEntries.length})
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {philosophicalEntries.map(entry => (
                <div 
                  key={entry.id} 
                  className="bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl space-y-3 relative shadow-sm hover:border-purple-500/30 transition-all"
                >
                  <button
                    onClick={() => handleDeletePhilosophy(entry.id)}
                    className="absolute top-4 right-4 p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      <h4 className="text-sm font-display font-bold text-slate-800 dark:text-slate-100">{entry.title}</h4>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 block">
                      Logged: {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-900/60">
                    "{entry.reflection}"
                  </p>

                  {entry.linkedDate && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold bg-purple-500/5 dark:bg-purple-500/10 px-2.5 py-1 rounded-md w-fit">
                      <Calendar className="w-3.5 h-3.5" /> Linked on Calendar: {entry.linkedDate}
                    </div>
                  )}
                </div>
              ))}

              {philosophicalEntries.length === 0 && (
                <div className="text-center py-12 bg-slate-100/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs font-mono">
                  No philosophical entries logged. Set parameters of mind.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 2: BOOK WISDOM */}
      {activePillar === 'books' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left" id="pillar-books-pane">
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-pink-500" /> Book Retention Form
              </h3>
              <form onSubmit={handleAddBookWisdom} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block mb-1">Book Title</label>
                    <input
                      type="text"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="e.g. Atomic Habits"
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-pink-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block mb-1">Author</label>
                    <input
                      type="text"
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                      placeholder="e.g. James Clear"
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-pink-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block mb-1">Brief Summary</label>
                  <input
                    type="text"
                    value={bookSummary}
                    onChange={(e) => setBookSummary(e.target.value)}
                    placeholder="Short summary of the core book thesis..."
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-pink-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block mb-1">Core Learnings (one per line)</label>
                  <textarea
                    value={bookLearningsText}
                    onChange={(e) => setBookLearningsText(e.target.value)}
                    placeholder="Write critical takeaways / rules of the book...&#10;- Lesson 1&#10;- Lesson 2"
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-pink-500 outline-none resize-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-pink-500" /> Link to Calendar Date
                  </label>
                  <input
                    type="date"
                    value={bookLinkedDate}
                    onChange={(e) => setBookLinkedDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-pink-500 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-mono font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Store Wisdom Entry
                </button>
              </form>
            </div>
          </div>

          {/* List Readout Side */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Wisdom Library ({bookWisdomEntries.length})
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {bookWisdomEntries.map(book => (
                <div 
                  key={book.id} 
                  className="bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl space-y-3 relative shadow-sm hover:border-pink-500/30 transition-all"
                >
                  <button
                    onClick={() => handleDeleteBookWisdom(book.id)}
                    className="absolute top-4 right-4 p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-pink-500 uppercase tracking-wider block">BOOK SPECIFICATION</span>
                    <h4 className="text-sm font-display font-bold text-slate-800 dark:text-slate-100">{book.title}</h4>
                    <p className="text-xs text-slate-400 italic">by {book.author}</p>
                  </div>

                  <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-900/60 text-xs">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block">Core Summary Thesis</span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{book.summary}</p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block">Core Learnings takeaways</span>
                    <ul className="list-none space-y-1">
                      {book.learnings.map((learning, idx) => (
                        <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5 leading-relaxed">
                          <span className="text-pink-500 text-xs select-none">•</span>
                          <span>{learning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {book.linkedDate && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-pink-600 dark:text-pink-400 font-semibold bg-pink-500/5 dark:bg-pink-500/10 px-2.5 py-1 rounded-md w-fit">
                      <Calendar className="w-3.5 h-3.5" /> Linked on Calendar: {book.linkedDate}
                    </div>
                  )}
                </div>
              ))}

              {bookWisdomEntries.length === 0 && (
                <div className="text-center py-12 bg-slate-100/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs font-mono">
                  No book wisdom recorded yet. Fill the library parameters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 3: INTUITION TRAINING */}
      {activePillar === 'intuition' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left" id="pillar-intuition-pane">
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" /> Log Gut Decision
              </h3>
              <form onSubmit={handleAddIntuition} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block mb-1">The Decision of Gut / Intuition</label>
                  <input
                    type="text"
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    placeholder="e.g. Declined the cloud merger proposal"
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block mb-1">Reasoning (Why did your gut flag this?)</label>
                  <textarea
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    placeholder="Document precisely what your body/intuition felt at the exact moment of the decision..."
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase block mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Date of Decision
                  </label>
                  <input
                    type="date"
                    value={decisionLinkedDate}
                    onChange={(e) => setDecisionLinkedDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Capture Intuition Anchor
                </button>
              </form>
            </div>
          </div>

          {/* Readout with Filters and Loops */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Gut Decisions Ledger ({filteredIntuitions.length})
              </h3>

              {/* Status Filters */}
              <div className="flex bg-slate-100 dark:bg-slate-950/40 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80 text-[10px] font-mono">
                <button
                  onClick={() => setIntuitionFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    intuitionFilter === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ALL
                </button>
                <button
                  onClick={() => setIntuitionFilter('pending')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    intuitionFilter === 'pending' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  PENDING
                </button>
                <button
                  onClick={() => setIntuitionFilter('resolved')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    intuitionFilter === 'resolved' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  RESOLVED
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredIntuitions.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl space-y-4 relative shadow-sm hover:border-indigo-500/30 transition-all"
                >
                  <button
                    onClick={() => handleDeleteIntuition(item.id)}
                    className="absolute top-4 right-4 p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        item.status === 'resolved' ? 'bg-indigo-500 animate-pulse' : 'bg-amber-500 animate-pulse'
                      }`} />
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                        item.status === 'resolved' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Date: {item.date}</span>
                    </div>
                    <h4 className="text-sm font-display font-bold text-slate-800 dark:text-slate-100">{item.decision}</h4>
                  </div>

                  <div className="space-y-1.5 text-xs bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-900/60">
                    <strong className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">Gut intuition & body cues reasoning</strong>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{item.reasoning}</p>
                  </div>

                  {/* Outcome display or form */}
                  {item.status === 'resolved' ? (
                    <div className="space-y-1.5 text-xs bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-950/50 p-3.5 rounded-xl">
                      <strong className="text-[9px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 font-bold">
                        <Award className="w-4 h-4 text-indigo-500" /> Refined Outcome feedback loop
                      </strong>
                      <p className="text-indigo-700 dark:text-indigo-300 font-sans leading-relaxed italic">"{item.outcome}"</p>
                    </div>
                  ) : editingIntuitionId === item.id ? (
                    <div className="space-y-3 bg-amber-500/5 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-950/50 p-4 rounded-xl">
                      <strong className="text-[10px] font-mono uppercase tracking-wider text-amber-500 block">Close the Feedback Loop</strong>
                      <textarea
                        value={tempOutcome}
                        onChange={(e) => setTempOutcome(e.target.value)}
                        placeholder="Log the ultimate outcome and lessons to score your intuition parameters..."
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setEditingIntuitionId(null); setTempOutcome(''); }}
                          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-200 rounded-lg text-xs font-mono"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleResolveIntuition(item.id)}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-mono font-bold hover:bg-indigo-500"
                        >
                          Submit Outcome
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingIntuitionId(item.id); setTempOutcome(''); }}
                      className="text-xs font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 w-fit"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Measure & Close Loop
                    </button>
                  )}

                  {item.linkedDate && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/5 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md w-fit">
                      <Calendar className="w-3.5 h-3.5" /> Linked on Calendar: {item.linkedDate}
                    </div>
                  )}
                </div>
              ))}

              {filteredIntuitions.length === 0 && (
                <div className="text-center py-12 bg-slate-100/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs font-mono">
                  No gut decisions found in this category. Write down a gut response.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 4: MEDITATION & STILLNESS */}
      {activePillar === 'meditation' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left" id="pillar-meditation-pane">
          {/* Breathing Guide Panel (3 columns) */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between text-center min-h-[480px] relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-full flex justify-between items-center border-b border-slate-200 dark:border-slate-800/60 pb-3 z-10">
              <span className="text-xs font-mono uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold">
                <Wind className="w-3.5 h-3.5 animate-pulse" /> Box Breathing Protocol
              </span>
              <span className="text-[10px] font-mono text-slate-400">4s Cyclic Rhythm</span>
            </div>

            {/* Breathing Animation Canvas Area */}
            <div className="flex flex-col items-center justify-center py-8 relative z-10">
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Visual pulsating ring */}
                <div 
                  className={`absolute rounded-full border-4 flex items-center justify-center transition-all duration-[1000ms] ease-out shadow-2xl ${
                    phaseDetails[breathingPhase].color
                  }`}
                  style={{
                    width: isBreathing ? `${phaseDetails[breathingPhase].scale * 120}px` : '120px',
                    height: isBreathing ? `${phaseDetails[breathingPhase].scale * 120}px` : '120px'
                  }}
                >
                  <div className="absolute inset-0 rounded-full border border-current opacity-10 scale-125 animate-ping" />
                </div>

                {/* Inner countdown readout */}
                <div className="z-20 text-center space-y-1">
                  <div className="text-4xl font-mono font-black text-slate-800 dark:text-white select-none">
                    {isBreathing ? breathCountdown : '4'}
                  </div>
                  <div className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 select-none">
                    SECONDS
                  </div>
                </div>
              </div>

              {/* Status and instruction banners */}
              <div className="mt-6 space-y-1 text-center h-14">
                <h4 className="text-base font-display font-bold text-slate-800 dark:text-slate-100 transition-colors">
                  {isBreathing ? phaseDetails[breathingPhase].label : 'Ready to Align'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-sm mx-auto">
                  {isBreathing ? phaseDetails[breathingPhase].sub : 'Box breathing clears executive brain fog and optimizes HRV.'}
                </p>
              </div>
            </div>

            {/* Breathing Controls */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/60 z-10">
              <button
                onClick={() => setIsBreathing(!isBreathing)}
                className={`px-8 py-3 rounded-xl font-mono text-xs font-bold uppercase transition-all shadow flex items-center gap-2 mx-auto cursor-pointer ${
                  isBreathing
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/10'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10'
                }`}
              >
                {isBreathing ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" /> Stop Protocol
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Start Breathing
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Soundscape Panel (2 columns) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between text-left shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/60 pb-3">
                <span className="text-xs font-mono uppercase text-slate-800 dark:text-slate-300 flex items-center gap-1.5 font-bold">
                  <Sliders className="w-3.5 h-3.5 text-purple-500" /> Focus Soundscape
                </span>
                {isSoundPlaying && (
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-purple-500 animate-duration-[800ms] animate-bounce shrink-0" />
                    <span className="w-1 h-4.5 bg-purple-500 animate-duration-[500ms] animate-bounce shrink-0" />
                    <span className="w-1 h-2 bg-purple-500 animate-duration-[1000ms] animate-bounce shrink-0" />
                  </div>
                )}
              </div>

              {/* Soundscape Selection Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'binaural', label: 'Binaural Theta', desc: '5.5Hz focus waves', emoji: '🧠' },
                  { id: 'hum', label: 'Cosmic Hum', desc: 'Deep warm grounding', emoji: '🪐' },
                  { id: 'drone', label: 'Zen Drone', desc: 'Evolving celestial pad', emoji: '✨' },
                  { id: 'waves', label: 'Ocean Waves', desc: 'Cyclic sea white-noise', emoji: '🌊' }
                ].map(sound => (
                  <button
                    key={sound.id}
                    onClick={() => setSoundType(sound.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20 cursor-pointer ${
                      soundType === sound.id
                        ? 'bg-purple-600/10 border-purple-500 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/20 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-bold truncate">{sound.label}</span>
                      <span className="text-sm shrink-0">{sound.emoji}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-tight truncate">{sound.desc}</span>
                  </button>
                ))}
              </div>

              {/* Volume Slider */}
              <div className="space-y-1.5 pt-3">
                <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
                  <span>Volume Parameters</span>
                  <span>{volume}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full outline-none"
                  />
                  <Volume2 className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Audio Toggle button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/60 mt-4">
              <button
                onClick={toggleSound}
                className={`w-full py-3 rounded-xl font-mono text-xs font-bold uppercase transition-all shadow flex items-center justify-center gap-2 cursor-pointer ${
                  isSoundPlaying
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/10'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/10'
                }`}
              >
                {isSoundPlaying ? (
                  <>
                    <VolumeX className="w-4 h-4" /> Mute Soundscape
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 fill-white" /> Play Soundscape
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
