import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Plus, 
  Trash2, 
  Droplet, 
  Heart, 
  Moon, 
  Footprints, 
  TrendingDown, 
  Percent,
  Calendar,
  Flame,
  Volume2,
  Play,
  Square,
  Check,
  Edit3,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  CheckSquare,
  Zap,
  BookOpen,
  Sun,
  Code,
  ShieldAlert,
  Dumbbell
} from 'lucide-react';
import { HealthLog, Habit } from '../types';
import { supabase } from '../supabase';
import { saveUserDataToCloud } from '../lib/supabaseSync';

interface VitalsManagerProps {
  userId?: string;
  healthLogs: Record<string, HealthLog>;
  updateHealthLog: (date: string, log: Partial<HealthLog>) => void;
  habits: Habit[];
  addHabit: (title: string) => void;
  toggleHabitCompleted: (id: string, dateStr: string) => void;
  deleteHabit: (id: string) => void;
}

export default function VitalsManager({
  userId,
  healthLogs,
  updateHealthLog,
  habits,
  addHabit,
  toggleHabitCompleted,
  deleteHabit
}: VitalsManagerProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Tab State: Habits Engine vs Biological Command Center
  const [activeTab, setActiveTab] = useState<'habits' | 'health'>('health');

  // --- Habit Form States ---
  const [newHabitTitle, setNewHabitTitle] = useState('');

  const handleCreateHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    addHabit(newHabitTitle.trim());
    setNewHabitTitle('');
  };

  // --- Biological Command Center States ---
  const [healthDate, setHealthDate] = useState(todayStr);
  const [steps, setSteps] = useState('8000');
  const [waterCups, setWaterCups] = useState('8'); // Log in cups
  const [sleep, setSleep] = useState('7.5');
  const [energyLevel, setEnergyLevel] = useState<number>(8); // Scale 1-10 for Energy Wave
  const [stressLevel, setStressLevel] = useState<number>(2); // Scale 1-5
  const [deepWorkHours, setDeepWorkHours] = useState('4'); // Output Index
  const [executionRank, setExecutionRank] = useState<'S' | 'A' | 'B' | 'C' | 'D' | 'F'>('A');
  const [nutrition, setNutrition] = useState<'Clean' | 'Moderate' | 'Poor'>('Clean');

  // Load selected date's metrics into the form
  useEffect(() => {
    const entry = healthLogs[healthDate] as any;
    if (entry) {
      setSteps(entry.steps?.toString() || '8000');
      
      // Handle hydration mapping
      if (entry.hydrationCups !== undefined) {
        setWaterCups(entry.hydrationCups.toString());
      } else if (entry.waterIntake !== undefined) {
        setWaterCups(Math.round(entry.waterIntake / 250).toString());
      } else {
        setWaterCups('8');
      }

      setSleep(entry.sleepHours?.toString() || '7.5');
      
      // Handle 1-5 to 1-10 energy mapping
      if (entry.energyLevel !== undefined) {
        setEnergyLevel(entry.energyLevel > 5 ? entry.energyLevel : entry.energyLevel * 2);
      } else {
        setEnergyLevel(8);
      }

      setStressLevel(entry.stressLevel || 2);
      setDeepWorkHours(entry.deepWorkHours?.toString() || '4');
      setExecutionRank(entry.executionRank || 'A');
      setNutrition(entry.nutritionRating || 'Clean');
    } else {
      // Default presets
      setSteps('8000');
      setWaterCups('8');
      setSleep('7.5');
      setEnergyLevel(8);
      setStressLevel(2);
      setDeepWorkHours('4');
      setExecutionRank('A');
      setNutrition('Clean');
    }
  }, [healthDate, healthLogs]);

  const handleSaveHealth = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSteps = parseInt(steps) || 0;
    const parsedCups = parseInt(waterCups) || 0;
    const parsedSleep = parseFloat(sleep) || 0;
    const parsedDeepWork = parseFloat(deepWorkHours) || 0;

    updateHealthLog(healthDate, {
      steps: parsedSteps,
      waterIntake: parsedCups * 250, // convert cups to ml for backward compatibility
      sleepHours: parsedSleep,
      energyLevel: energyLevel, // store 1-10 Energy Wave
      // Save new metrics as custom properties
      stressLevel,
      hydrationCups: parsedCups,
      deepWorkHours: parsedDeepWork,
      executionRank,
      nutritionRating: nutrition
    } as any);

    // Provide visual feedback
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const [saveFeedback, setSaveFeedback] = useState(false);

  // Quick 1-Tap Log preset
  const handleQuickLog = () => {
    updateHealthLog(todayStr, {
      steps: 10000,
      waterIntake: 10 * 250, // 10 cups
      sleepHours: 8.0,
      energyLevel: 9,
      stressLevel: 1,
      hydrationCups: 10,
      deepWorkHours: 6.0,
      executionRank: 'S',
      nutritionRating: 'Clean'
    } as any);
    
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  // --- Dynamic Calendar State & Math ---
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth()); // 0-11
  const [calendarColorMode, setCalendarColorMode] = useState<'energy' | 'rank'>('energy');

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  // Calendar Math
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    const prevMonthTotalDays = new Date(calendarYear, calendarMonth, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const pMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
      const pYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
      const d = prevMonthTotalDays - i;
      days.push({
        dateStr: `${pYear}-${String(pMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      days.push({
        dateStr: `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: true
      });
    }

    // Next month padding to complete grid
    const totalGridCells = 42; // 6 rows of 7 days
    const nextPaddingCount = totalGridCells - days.length;
    for (let d = 1; d <= nextPaddingCount; d++) {
      const nMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
      const nYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
      days.push({
        dateStr: `${nYear}-${String(nMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: false
      });
    }

    return days;
  }, [calendarYear, calendarMonth]);

  // Helper to color code calendar cells
  const getCellBiometrics = (dateStr: string) => {
    const entry = healthLogs[dateStr] as any;
    if (!entry) return null;

    const rawEnergy = entry.energyLevel || 0;
    const energy = rawEnergy > 5 ? rawEnergy : rawEnergy * 2; // scale up 1-5 to 1-10
    const rank = entry.executionRank || '';
    
    let colorClass = '';
    let textColorClass = 'text-slate-400';
    let statusLabel = '';

    if (calendarColorMode === 'energy') {
      if (energy >= 8) {
        colorClass = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30';
        statusLabel = 'PEAK';
      } else if (energy >= 5) {
        colorClass = 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30';
        statusLabel = 'RECOVERY';
      } else if (energy > 0) {
        colorClass = 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/30';
        statusLabel = 'DEFICIT';
      }
    } else {
      // Color-coding by Execution Rank
      if (rank === 'S' || rank === 'A') {
        colorClass = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30';
        statusLabel = rank;
      } else if (rank === 'B' || rank === 'C') {
        colorClass = 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30';
        statusLabel = rank;
      } else if (rank === 'D' || rank === 'F') {
        colorClass = 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/30';
        statusLabel = rank;
      }
    }

    return { colorClass, statusLabel, energy, rank };
  };

  // --- "Rude Reality" Engine Core Logic ---
  const activeLog = (healthLogs[healthDate] || { steps: 0, waterIntake: 0, sleepHours: 0, energyLevel: 0 }) as any;
  const rudeFeedback = useMemo(() => {
    const rawEnergy = activeLog.energyLevel || 0;
    const energy = rawEnergy > 5 ? rawEnergy : rawEnergy * 2;
    const sleepVal = activeLog.sleepHours || 0;
    const stress = activeLog.stressLevel || 0;
    const rank = activeLog.executionRank || '';
    
    // Check if anything is logged
    if (!activeLog.steps && !activeLog.sleepHours && !activeLog.waterIntake && !activeLog.energyLevel) {
      return {
        mode: 'UNKNOWN',
        modeLabel: 'SYSTEM IN THE BLIND',
        title: '⚠️ BIOMETRIC BLACKOUT',
        message: 'No biological metrics recorded for this date. You are piloting an elite high-performance vehicle with your eyes shut. Speed log your state below immediately.',
        severity: 'warning',
        action: 'Perform 60-Second Rapid Log'
      };
    }

    // High stress, low sleep, or low energy triggers Recovery Mode
    if (sleepVal < 6.5) {
      return {
        mode: 'RECOVERY',
        modeLabel: 'FORCE RECOVERY MODE',
        title: '🚨 CRITICAL SLEEP DEPRECIATION',
        message: `Operating on a massive sleep deficit of ${sleepVal} hours. Prefrontal blood flow is compromised. Cognitive processing speed is reduced by up to 35%. Postpone high-risk strategy sprints, run automated routines today, and force-hydrate.`,
        severity: 'danger',
        action: 'Initiate 4-Sec Box-Breathing reset and play Deep Sleep soundscapes.'
      };
    }

    if (stress >= 4) {
      return {
        mode: 'RECOVERY',
        modeLabel: 'FORCE RECOVERY MODE',
        title: '⚡ CRITICAL SYMPATHETIC LOAD',
        message: 'Cortisol and heart-rate variability indicators show excessive fight-or-flight signaling. Amygdala reactivity is high, leading to sub-optimal choices under pressure. Terminate caffeine intake, engage the stillness loop.',
        severity: 'danger',
        action: 'Launch box breathing cycle and execute soft mobility stretching.'
      };
    }

    // Hydration check
    const cupsVal = activeLog.hydrationCups !== undefined ? activeLog.hydrationCups : (activeLog.waterIntake ? Math.round(activeLog.waterIntake / 250) : 0);
    if (cupsVal < 6) {
      return {
        mode: 'RECOVERY',
        modeLabel: 'RECOVERY ENFORCED',
        title: '💧 SEVERE DEHYDRATION DETECTED',
        message: `Hydration level stands at only ${cupsVal} cups. Blood viscosity is elevated, resulting in sub-optimal cellular oxygenation. Brain volume physically contracts under dehydration, inducing focus fatigue.`,
        severity: 'warning',
        action: 'Drink 500ml pure electrolyte water immediately.'
      };
    }

    // Optimal Performance Mode
    if (energy >= 8 && sleepVal >= 7.5 && stress <= 2) {
      return {
        mode: 'OPTIMAL',
        modeLabel: 'OPTIMAL PERFORMANCE MODE',
        title: '🔥 BIOLOGICAL ENGINES FLUSHED',
        message: `Nervous system balance achieved. Energy index is at peak ${energy}/10. High-stakes execution readiness is active. This is your window to execute high-cognitive design sprints, difficult architectural challenges, and critical decisions.`,
        severity: 'success',
        action: 'Deploy extreme cognitive force. Tackle your hardest MIT now.'
      };
    }

    // Default Balanced Mode
    return {
      mode: 'BALANCED',
      modeLabel: 'MODERATE OPERATING MODE',
      title: '⚖️ STANDARD STEADY STATE',
      message: 'System biometrics are stable. Normal functional capacity is verified. Protect your energy assets throughout the day by incorporating micro-breaks and sustaining hydration cycles.',
      severity: 'neutral',
      action: 'Maintain momentum. Keep habits aligned.'
    };
  }, [activeLog, healthDate]);

  // --- Dynamic SVG Correlation Chart Math ---
  const last10Logs = useMemo(() => {
    return Object.keys(healthLogs)
      .sort((a, b) => a.localeCompare(b))
      .slice(-10)
      .map(date => {
        const entry = healthLogs[date] as any;
        const rawEnergy = entry.energyLevel || 0;
        const energy10 = rawEnergy > 5 ? rawEnergy : rawEnergy * 2;
        
        let rankValue = 5; // Default C
        if (entry.executionRank === 'S') rankValue = 10;
        else if (entry.executionRank === 'A') rankValue = 8.5;
        else if (entry.executionRank === 'B') rankValue = 7;
        else if (entry.executionRank === 'C') rankValue = 5;
        else if (entry.executionRank === 'D') rankValue = 3;
        else if (entry.executionRank === 'F') rankValue = 1;

        const deepWork = entry.deepWorkHours || 0;

        return {
          date: date.slice(5), // MM-DD
          energy: energy10,
          rankValue,
          deepWork
        };
      });
  }, [healthLogs]);

  // SVG dimensions
  const chartWidth = 520;
  const chartHeight = 180;
  const chartPadding = { left: 40, right: 20, top: 20, bottom: 30 };
  const graphWidth = chartWidth - chartPadding.left - chartPadding.right;
  const graphHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  const svgPoints = useMemo(() => {
    if (last10Logs.length < 2) return { energyPath: '', performancePath: '', points: [] };

    const points: { x: number; ey: number; py: number; raw: any }[] = [];

    last10Logs.forEach((log, i) => {
      const x = chartPadding.left + (i * (graphWidth / (last10Logs.length - 1)));
      
      // Map Energy (0-10) to Y
      const ey = chartPadding.top + graphHeight - ((log.energy / 10) * graphHeight);
      
      // Map Execution Rank (0-10 scale) to Y
      const py = chartPadding.top + graphHeight - ((log.rankValue / 10) * graphHeight);

      points.push({ x, ey, py, raw: log });
    });

    const energyPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.ey}`).join(' ');
    const performancePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.py}`).join(' ');

    return { energyPath, performancePath, points };
  }, [last10Logs]);

  // --- Exercise and Neural Optimization Rules ---
  const [exercises, setExercises] = useState<{ id: string; type: string; goal: string }[]>(() => {
    const saved = localStorage.getItem('lifeos_exercise_rules');
    return saved ? JSON.parse(saved) : [
      { id: 'ex-1', type: 'Resistance Training (Strength)', goal: '4 sessions / week, progressive overload' },
      { id: 'ex-2', type: 'Zone 2 Cardio (Mitochondrial)', goal: '150 mins / week, steady aerobic heart rate' },
      { id: 'ex-3', type: 'Mobility & Joint Safety', goal: '15 mins daily post-wake, active dynamic stretching' },
      { id: 'ex-4', type: 'Zone 5 VO2 Max training', goal: '1 session / week, 4x4 high-intensity intervals' }
    ];
  });

  // Sync states to local storage and Supabase Cloud
  useEffect(() => {
    localStorage.setItem('lifeos_exercise_rules', JSON.stringify(exercises));
    if (userId) {
      saveUserDataToCloud(userId, 'exerciseRules', exercises);
    }
  }, [exercises, userId]);

  // Real-time listener for cloud changes across tabs or devices
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.key === 'lifeos_exercise_rules') {
        const cloudVal = customEvent.detail.value;
        if (JSON.stringify(cloudVal) !== JSON.stringify(exercises)) {
          setExercises(cloudVal);
        }
      }
    };
    window.addEventListener('local-storage-sync', handleSync);
    return () => {
      window.removeEventListener('local-storage-sync', handleSync);
    };
  }, [exercises]);

  const [newExType, setNewExType] = useState('');
  const [newExGoal, setNewExGoal] = useState('');

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExType.trim() || !newExGoal.trim()) return;
    const rule = {
      id: `ex-${Date.now()}`,
      type: newExType.trim(),
      goal: newExGoal.trim()
    };
    const updated = [...exercises, rule];
    setExercises(updated);
    setNewExType('');
    setNewExGoal('');
  };

  const handleDeleteExercise = (id: string) => {
    const updated = exercises.filter(ex => ex.id !== id);
    setExercises(updated);
  };

  // --- Soundscape Web Audio Synth Engine ---
  const [activeSynth, setActiveSynth] = useState<'focus' | 'sleep' | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{
    oscL?: OscillatorNode;
    oscR?: OscillatorNode;
    oscSub?: OscillatorNode;
    gainNode?: GainNode;
    lfo?: OscillatorNode;
    filter?: BiquadFilterNode;
  }>({});

  const stopAudio = () => {
    const nodes = synthNodesRef.current;
    if (nodes.oscL) { try { nodes.oscL.stop(); } catch(e){} }
    if (nodes.oscR) { try { nodes.oscR.stop(); } catch(e){} }
    if (nodes.oscSub) { try { nodes.oscSub.stop(); } catch(e){} }
    if (nodes.lfo) { try { nodes.lfo.stop(); } catch(e){} }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    synthNodesRef.current = {};
    setActiveSynth(null);
  };

  const startAudio = (type: 'focus' | 'sleep') => {
    stopAudio(); // Reset any existing synth

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // Master output volume limit node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.12, ctx.currentTime); // Safe, low, calming background level

      // Create filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(type === 'focus' ? 220 : 130, ctx.currentTime);
      filter.Q.setValueAtTime(1, ctx.currentTime);

      // Channel merger for Stereo Binaural Separation
      const merger = ctx.createChannelMerger(2);

      // Left and Right Oscillators for Binaural Beats
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      
      // Sub hum for deep resonance
      const oscSub = ctx.createOscillator();
      oscSub.type = 'triangle';

      if (type === 'focus') {
        // Carrier 110Hz L, 116Hz R -> 6Hz Theta frequency (Focus waves)
        oscL.frequency.setValueAtTime(110, ctx.currentTime);
        oscR.frequency.setValueAtTime(116, ctx.currentTime);
        oscSub.frequency.setValueAtTime(55, ctx.currentTime); // A1 bass grounding octave
      } else {
        // Carrier 90Hz L, 93.5Hz R -> 3.5Hz Delta frequency (Deep Sleep slow healing waves)
        oscL.frequency.setValueAtTime(90, ctx.currentTime);
        oscR.frequency.setValueAtTime(93.5, ctx.currentTime);
        oscSub.frequency.setValueAtTime(45, ctx.currentTime); // F#0 deep hum
      }

      // Route Left
      const gainL = ctx.createGain();
      gainL.gain.setValueAtTime(0.5, ctx.currentTime);
      oscL.connect(gainL);
      gainL.connect(merger, 0, 0);

      // Route Right
      const gainR = ctx.createGain();
      gainR.gain.setValueAtTime(0.5, ctx.currentTime);
      oscR.connect(gainR);
      gainR.connect(merger, 0, 1);

      // LFO to create peaceful respiratory-like low cutoff sweeps
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // ~12 seconds slow respiration sweep
      lfoGain.gain.setValueAtTime(40, ctx.currentTime); // frequency modulation range

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Connect sources to filter
      merger.connect(filter);
      
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.35, ctx.currentTime);
      oscSub.connect(subGain);
      subGain.connect(filter);

      // Output chain
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Play
      oscL.start();
      oscR.start();
      oscSub.start();
      lfo.start();

      synthNodesRef.current = {
        oscL, oscR, oscSub, lfo, filter, gainNode: masterGain
      };

      setActiveSynth(type);
    } catch (e) {
      console.error("Web Audio API not supported or blocked: ", e);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio(); // cleanup synthesizer on unmount
    };
  }, []);

  // --- Zen Box Breathing State Machine ---
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'idle' | 'inhale' | 'hold1' | 'exhale' | 'hold2'>('idle');
  const [breathingSecondsLeft, setBreathingSecondsLeft] = useState(4);
  const breathingTimerRef = useRef<any>(null);

  const startBreathingCycle = () => {
    setIsBreathingModalOpen(true);
    setBreathingPhase('inhale');
    setBreathingSecondsLeft(4);
  };

  useEffect(() => {
    if (breathingPhase === 'idle') {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
      return;
    }

    breathingTimerRef.current = setInterval(() => {
      setBreathingSecondsLeft(prev => {
        if (prev <= 1) {
          // Transition phase
          setBreathingPhase(current => {
            switch (current) {
              case 'inhale': return 'hold1';
              case 'hold1': return 'exhale';
              case 'exhale': return 'hold2';
              case 'hold2': return 'inhale';
              default: return 'idle';
            }
          });
          return 4; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    };
  }, [breathingPhase]);

  const stopBreathingCycle = () => {
    setBreathingPhase('idle');
    setIsBreathingModalOpen(false);
  };

  // Habit Consistency Calculations
  const getDynamicStreak = (habit: Habit, baseDateStr: string): number => {
    let count = 0;
    let curr = new Date(baseDateStr);
    let maxIter = 100; // safety limit
    while (maxIter > 0) {
      maxIter--;
      const dateStr = curr.toISOString().split('T')[0];
      if (habit.history[dateStr] === true) {
        count++;
        curr.setDate(curr.getDate() - 1);
      } else {
        // If it's today and not done, but was done yesterday, we can continue backwards from yesterday
        if (dateStr === baseDateStr && !habit.history[dateStr]) {
          const yesterday = new Date(baseDateStr);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          if (habit.history[yesterdayStr] === true) {
            curr.setDate(curr.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }
    return count;
  };

  const getConsistencyScore = (dateStr: string): number => {
    if (habits.length === 0) return 0;
    const completedCount = habits.filter(h => h.history[dateStr] === true).length;
    return Math.round((completedCount / habits.length) * 100);
  };

  const selectedScore = getConsistencyScore(healthDate);

  const getHabit30DayCompletionRate = (habit: Habit): number => {
    const last30DaysLocal = Array.from({ length: 30 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - idx));
      return d.toISOString().split('T')[0];
    });
    const completedCount = last30DaysLocal.filter(dateStr => habit.history[dateStr] === true).length;
    return Math.round((completedCount / 30) * 100);
  };

  const last30Days = useMemo(() => {
    return Array.from({ length: 30 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - idx));
      return d.toISOString().split('T')[0];
    });
  }, []);

  const hasHabitAlert = useMemo(() => {
    if (habits.length === 0) return false;
    
    // Check 3 consecutive days ending at healthDate
    const datesToCheck: string[] = [];
    const baseDate = new Date(healthDate);
    for (let i = 0; i < 3; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      datesToCheck.push(d.toISOString().split('T')[0]);
    }

    // Return true if for ALL 3 dates, consistency score is below 50%
    return datesToCheck.every(d => getConsistencyScore(d) < 50);
  }, [habits, healthDate]);

  const getHabitIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('breath') || t.includes('zen') || t.includes('meditation') || t.includes('stillness')) {
      return <Sparkles className="w-4.5 h-4.5 text-cyan-500 dark:text-cyan-400" />;
    }
    if (t.includes('water') || t.includes('hydrate') || t.includes('hydration') || t.includes('drink')) {
      return <Droplet className="w-4.5 h-4.5 text-blue-500 dark:text-blue-400" />;
    }
    if (t.includes('code') || t.includes('program') || t.includes('challenge') || t.includes('architecture') || t.includes('challenge') || t.includes('challenge') || t.includes('build')) {
      return <Code className="w-4.5 h-4.5 text-purple-500 dark:text-purple-400" />;
    }
    if (t.includes('read') || t.includes('book') || t.includes('audio')) {
      return <BookOpen className="w-4.5 h-4.5 text-emerald-500 dark:text-emerald-400" />;
    }
    if (t.includes('sleep') || t.includes('rest') || t.includes('night')) {
      return <Moon className="w-4.5 h-4.5 text-indigo-500 dark:text-indigo-400" />;
    }
    if (t.includes('wake') || t.includes('morning') || t.includes('early')) {
      return <Sun className="w-4.5 h-4.5 text-amber-500 dark:text-amber-400" />;
    }
    if (t.includes('exercise') || t.includes('gym') || t.includes('workout') || t.includes('lift') || t.includes('sport') || t.includes('cardio') || t.includes('run')) {
      return <Dumbbell className="w-4.5 h-4.5 text-rose-500 dark:text-rose-400" />;
    }
    return <Zap className="w-4.5 h-4.5 text-yellow-500 dark:text-yellow-400" />;
  };

  return (
    <div className="space-y-6 text-left" id="vitals-manager-panel">
      
      {/* Sub Navigation Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/80">
        <button 
          onClick={() => setActiveTab('health')}
          className={`px-5 py-3 text-xs font-mono font-medium tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'health' 
              ? 'border-cyan-600 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          id="tab-health-command"
        >
          <Activity className="w-4 h-4" /> BIOLOGICAL COMMAND CENTER
        </button>
        <button 
          onClick={() => setActiveTab('habits')}
          className={`px-5 py-3 text-xs font-mono font-medium tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'habits' 
              ? 'border-cyan-600 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          id="tab-habit-consistency"
        >
          <CheckSquare className="w-4 h-4" /> HABIT CONSISTENCY ENGINE
        </button>
      </div>

      {activeTab === 'habits' ? (
        <div className="space-y-6 animate-fadeIn" id="vitals-habits-view">
          
          {/* Performance Alert (Rude Reality Logic) */}
          {hasHabitAlert && (
            <div className="p-5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-start gap-3.5 mb-6 animate-pulse" id="habit-performance-alert-banner">
              <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider">PERFORMANCE ALERT: ACCUMULATED EXECUTION FAILURE</h4>
                <p className="text-xs mt-1 leading-relaxed">
                  System has detected sub-50% consistency for 3 consecutive days leading up to <span className="font-bold underline">{healthDate}</span>. 
                  Your current habit backlog is over-saturated. Reduce your active daily load immediately. Standardize before you optimize. Do not over-commit and under-deliver.
                </p>
              </div>
            </div>
          )}

          {/* Daily Score Summary Banner */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6" id="habit-score-banner">
            <div className="flex items-center gap-5">
              {/* High-Impact Circular Progress */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="34" 
                    className="stroke-slate-200 dark:stroke-slate-850" 
                    strokeWidth="6" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="34" 
                    className="stroke-cyan-500 transition-all duration-500 ease-out" 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 - (selectedScore / 100) * (2 * Math.PI * 34)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-lg font-mono font-bold text-slate-800 dark:text-slate-100">{selectedScore}%</span>
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
                  Daily Consistency Index
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Aggregation of habits completed for <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{healthDate}</span>.
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">STATUS:</span>
                  {selectedScore >= 75 ? (
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md font-bold font-mono">PEAK</span>
                  ) : selectedScore >= 50 ? (
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md font-bold font-mono">RECOVERY</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-md font-bold font-mono">DEFICIT</span>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Date Quick Link */}
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 p-4 rounded-xl text-xs flex flex-col justify-center max-w-sm w-full">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">SYSTEM INSTANT SYNC</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                Toggling habits updates history instantly. Highlighted block represents <span className="font-bold text-cyan-600 dark:text-cyan-400">{healthDate}</span> on the 30-day mini-grid.
              </p>
            </div>
          </div>

          {/* Quick Log Habit Matrix Grid */}
          <div className="grid grid-cols-1 gap-4" id="habit-matrix-dashboard">
            {habits.map((habit) => {
              const isDone = habit.history[healthDate] === true;
              const habitStreak = getDynamicStreak(habit, todayStr);
              const completionRate = getHabit30DayCompletionRate(habit);
              
              return (
                <div 
                  key={habit.id}
                  className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300"
                >
                  {/* Left part: Habit Title, Icon and Streak Stats */}
                  <div className="flex items-center gap-4 min-w-[280px]">
                    {/* Toggle Indicator Button / Check Ring */}
                    <button
                      onClick={() => toggleHabitCompleted(habit.id, healthDate)}
                      className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-all duration-300 ${
                        isDone 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 scale-105' 
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300 hover:text-slate-500'
                      }`}
                      title={isDone ? "Completed! Click to toggle." : "Mark as completed!"}
                    >
                      {isDone ? <Check className="w-5 h-5 stroke-[3px]" /> : <Plus className="w-4 h-4" />}
                    </button>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        {getHabitIcon(habit.title)}
                        <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-slate-100 truncate text-[1.05rem]">
                          {habit.title}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1.5">
                        {/* Streak Counter badge */}
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                          habitStreak > 0 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                            : 'bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800'
                        }`}>
                          🔥 {habitStreak} {habitStreak === 1 ? 'DAY' : 'DAYS'}
                        </span>

                        {/* Completion Rate percentage badge */}
                        <span className="text-[10px] font-mono font-semibold text-slate-500">
                          30D Rate: {completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle part: 30-Day mini contributor grid */}
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-2 block">
                      30-DAY EXECUTION MATRIX
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                      {last30Days.map((dateStr) => {
                        const dayDone = habit.history[dateStr] === true;
                        const dayIsCurrent = dateStr === healthDate;
                        const formattedDate = new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        return (
                          <button 
                            key={dateStr}
                            onClick={() => setHealthDate(dateStr)}
                            title={`${formattedDate}: ${dayDone ? 'Completed' : 'Not Completed'}`}
                            className={`w-4 h-4 rounded-sm transition-all duration-150 shrink-0 cursor-pointer ${
                              dayDone 
                                ? 'bg-emerald-500 dark:bg-emerald-500 hover:bg-emerald-400' 
                                : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'
                            } ${
                              dayIsCurrent 
                                ? 'ring-2 ring-cyan-500 ring-offset-1 dark:ring-offset-slate-900 scale-110' 
                                : ''
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Right part: Delete Habit */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to completely delete the habit "${habit.title}"?`)) {
                          deleteHabit(habit.id);
                        }
                      }}
                      className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}

            {habits.length === 0 && (
              <div className="text-center py-16 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-850 rounded-2xl text-slate-500">
                <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-45" />
                <p className="text-sm font-semibold">No active habits defined.</p>
                <p className="text-xs mt-1">Append custom habits below to build your consistency engine.</p>
              </div>
            )}
          </div>

          {/* Append New Habit Input Layer */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 mb-2">
              Add New Habit Pillar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Expand your system with a standardized daily objective to track physical or cognitive adaptation.
            </p>

            <form onSubmit={handleCreateHabitSubmit} className="flex gap-2">
              <input 
                type="text"
                placeholder="e.g. Early Wake-up, 45m Zone 2 Cardio, Technical Reading..."
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:border-cyan-500 outline-none"
                required
              />
              <button 
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Append Habit
              </button>
            </form>
          </div>

        </div>
      ) : (
        /* Biological Command Center View */
        <div className="space-y-6" id="vitals-biological-command">
          
          {/* Top row: Philosophy "Rude Reality" Engine & Action Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="biological-reality-row">
            
            {/* The Blunt Motivating "Rude Reality" Engine */}
            <div className={`lg:col-span-2 glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between border-l-4 ${
              rudeFeedback.severity === 'danger' ? 'border-l-rose-500' : 
              rudeFeedback.severity === 'warning' ? 'border-l-amber-500' :
              rudeFeedback.severity === 'success' ? 'border-l-emerald-500' : 'border-l-cyan-500'
            }`} id="rude-reality-engine-card">
              <div>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border font-bold ${
                    rudeFeedback.severity === 'danger' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse' :
                    rudeFeedback.severity === 'warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    rudeFeedback.severity === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-550 border-cyan-500/20'
                  }`}>
                    {rudeFeedback.modeLabel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">AUDIT DATE: {healthDate}</span>
                </div>

                <div className="mt-4">
                  <h2 className="text-base font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {rudeFeedback.title}
                  </h2>
                  <p className="text-xs text-slate-650 dark:text-slate-350 mt-2 leading-relaxed text-left font-sans text-[1.05rem]">
                    {rudeFeedback.message}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Tactical Action Required:</span>
                  <p className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">{rudeFeedback.action}</p>
                </div>
                {rudeFeedback.mode === 'RECOVERY' && (
                  <button 
                    onClick={startBreathingCycle}
                    className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                  >
                    <Activity className="w-3.5 h-3.5" /> Execute Vagus Reset
                  </button>
                )}
                {rudeFeedback.mode === 'UNKNOWN' && (
                  <button 
                    onClick={() => setHealthDate(todayStr)}
                    className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" /> Log For Today
                  </button>
                )}
              </div>
            </div>

            {/* Stillness & Reset Audio Machine */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between" id="soundscape-ambient-pillar">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200">Stillness & Neural Reset</h3>
                  <span className="text-[10px] font-mono text-slate-500">NEURAL COHERENCE</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Run the stereo binaural drone synthesizer to block ambient cognitive noise and down-regulate stress.</p>
                
                <div className="space-y-2">
                  {/* Focus Synth Button */}
                  <button 
                    onClick={() => activeSynth === 'focus' ? stopAudio() : startAudio('focus')}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      activeSynth === 'focus' 
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 neon-glow-blue' 
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activeSynth === 'focus' ? 'bg-cyan-500/20 text-cyan-500' : 'bg-slate-200 dark:bg-slate-850 text-slate-500'}`}>
                        <Volume2 className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold font-mono">BINAURAL FOCUS WAVE</p>
                        <p className="text-[10px] text-slate-500">6Hz Theta Beat + Sub carrier hum</p>
                      </div>
                    </div>
                    {activeSynth === 'focus' ? <Square className="w-4 h-4 fill-current shrink-0" /> : <Play className="w-4 h-4 fill-current shrink-0" />}
                  </button>

                  {/* Sleep Synth Button */}
                  <button 
                    onClick={() => activeSynth === 'sleep' ? stopAudio() : startAudio('sleep')}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      activeSynth === 'sleep' 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 neon-glow-green' 
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activeSynth === 'sleep' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-200 dark:bg-slate-850 text-slate-500'}`}>
                        <Moon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold font-mono">DEEP RECOVERY DRONE</p>
                        <p className="text-[10px] text-slate-500">3.5Hz Delta Wave + Low frequency hum</p>
                      </div>
                    </div>
                    {activeSynth === 'sleep' ? <Square className="w-4 h-4 fill-current shrink-0" /> : <Play className="w-4 h-4 fill-current shrink-0" />}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>STATUS: {activeSynth ? 'SYNTHESIZER BROADCASTING...' : 'SYNTH SILENT'}</span>
                {activeSynth && (
                  <button onClick={stopAudio} className="text-rose-500 hover:text-rose-600 cursor-pointer flex items-center gap-0.5">
                    <Square className="w-3 h-3 fill-current" /> KILL AUDIO
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Middle row: The Bio-Calendar and 60-Second Rapid Log Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="biological-data-row">
            
            {/* The Bio-Calendar Widget (Unified Tracking) */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between" id="bio-calendar-container">
              <div>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Calendar className="w-4.5 h-4.5 text-cyan-500" />
                      AETHER Biological Calendar
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Color coded subjective energy mapping.</p>
                  </div>

                  {/* Calendar controls */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Color Mapping Mode Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg text-[10px] font-mono">
                      <button 
                        onClick={() => setCalendarColorMode('energy')}
                        className={`px-2 py-1 rounded cursor-pointer ${
                          calendarColorMode === 'energy' 
                            ? 'bg-cyan-500 text-white dark:text-slate-950 font-bold' 
                            : 'text-slate-500'
                        }`}
                      >
                        Energy Wave
                      </button>
                      <button 
                        onClick={() => setCalendarColorMode('rank')}
                        className={`px-2 py-1 rounded cursor-pointer ${
                          calendarColorMode === 'rank' 
                            ? 'bg-cyan-500 text-white dark:text-slate-950 font-bold' 
                            : 'text-slate-500'
                        }`}
                      >
                        Execution Rank
                      </button>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
                      <button 
                        onClick={handlePrevMonth}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-900 rounded text-slate-500 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-mono font-bold px-2 text-slate-700 dark:text-slate-300 w-24 text-center">
                        {monthNames[calendarMonth]} {calendarYear}
                      </span>
                      <button 
                        onClick={handleNextMonth}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-900 rounded text-slate-500 cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono mb-2" id="calendar-days-header">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <span key={day} className="text-[10px] text-slate-555 font-bold tracking-wider">{day}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2" id="calendar-days-grid">
                  {calendarDays.map((dayCell) => {
                    const isSelected = healthDate === dayCell.dateStr;
                    const biometrics = getCellBiometrics(dayCell.dateStr);
                    const isToday = todayStr === dayCell.dateStr;
                    
                    return (
                      <div 
                        key={dayCell.dateStr}
                        onClick={() => setHealthDate(dayCell.dateStr)}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between items-center aspect-square text-center relative cursor-pointer group transition-all duration-200 select-none ${
                          dayCell.isCurrentMonth 
                            ? 'text-slate-800 dark:text-slate-100' 
                            : 'text-slate-350 dark:text-slate-700 opacity-30'
                        } ${
                          biometrics?.colorClass || 'bg-slate-100/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                        } ${
                          isSelected 
                            ? 'ring-2 ring-cyan-500 dark:ring-cyan-400 border-cyan-500 shadow-md scale-102 font-bold' 
                            : ''
                        }`}
                      >
                        {/* Day Number */}
                        <span className={`text-[11px] font-bold ${isToday ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-full w-5 h-5 flex items-center justify-center border border-cyan-500/10' : ''}`}>
                          {dayCell.dayNum}
                        </span>

                        {/* Miniature Tag / Stat Display (Contrast-compliant) */}
                        {biometrics ? (
                          <span className="text-[8px] font-mono font-bold uppercase tracking-tight scale-90 px-1 py-0.2 bg-slate-950/10 dark:bg-slate-950/40 rounded border border-slate-950/5 dark:border-white/5 text-slate-800 dark:text-white shrink-0 mt-1">
                            {calendarColorMode === 'energy' ? `⚡${biometrics.energy}` : biometrics.statusLabel}
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono text-slate-400/40 shrink-0 mt-1">•</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid Legend */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap justify-between items-center text-[10px] font-mono text-slate-500 gap-4">
                <div className="flex items-center gap-4">
                  <span className="font-bold uppercase">Legend ({calendarColorMode === 'energy' ? 'Energy Level' : 'Execution Rank'}):</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Peak ({calendarColorMode === 'energy' ? '8-10' : 'S/A'})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Recovery ({calendarColorMode === 'energy' ? '5-7' : 'B/C'})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Deficit ({calendarColorMode === 'energy' ? '1-4' : 'D/F'})
                    </span>
                  </div>
                </div>
                <span>*Click on any day cell to load, log, or revise details</span>
              </div>
            </div>

            {/* 60-Second Rapid Log Panel */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col justify-between" id="rapid-log-panel">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200">60-Sec Rapid Log</h3>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">SPEED LOG</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Set biometrics for <span className="font-bold text-cyan-600 dark:text-cyan-400">{healthDate}</span> in a few taps.</p>

                <form onSubmit={handleSaveHealth} className="space-y-4">
                  {/* Energy Wave Slider (1-10) */}
                  <div>
                    <div className="flex justify-between items-center text-[11px] font-mono font-bold tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      <span className="uppercase">Energy Wave Rating</span>
                      <span className="text-amber-500">⚡ {energyLevel} / 10</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range"
                        min="1"
                        max="10"
                        value={energyLevel}
                        onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
                      />
                    </div>
                  </div>

                  {/* Sleep and Hydration */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-700 dark:text-slate-300 block mb-1 uppercase font-bold tracking-wider">Sleep (Hrs)</label>
                      <input 
                        type="number"
                        step="0.1"
                        value={sleep}
                        onChange={(e) => setSleep(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1.5 text-xs focus:border-cyan-500 outline-none font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-700 dark:text-slate-300 block mb-1 uppercase font-bold tracking-wider">Hydration (Cups)</label>
                      <input 
                        type="number"
                        value={waterCups}
                        onChange={(e) => setWaterCups(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1.5 text-xs focus:border-cyan-500 outline-none font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Stress Level Level Row (1-5 Buttons) */}
                  <div>
                    <label className="text-[11px] font-mono text-slate-700 dark:text-slate-300 block mb-1 uppercase font-bold tracking-wider">Stress level (Sympathetic Load)</label>
                    <div className="grid grid-cols-5 gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setStressLevel(level)}
                          className={`py-1 rounded text-xs font-mono font-bold cursor-pointer border transition-all ${
                            stressLevel === level
                              ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 scale-105'
                              : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Output Index & Daily Execution Rank */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-slate-700 dark:text-slate-300 block mb-1 uppercase font-bold tracking-wider">Deep Work (Hrs)</label>
                      <input 
                        type="number"
                        step="0.5"
                        value={deepWorkHours}
                        onChange={(e) => setDeepWorkHours(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1.5 text-xs focus:border-cyan-500 outline-none font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-slate-700 dark:text-slate-300 block mb-1 uppercase font-bold tracking-wider">Execution Rank</label>
                      <select 
                        value={executionRank}
                        onChange={(e) => setExecutionRank(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg p-1.5 text-xs focus:border-cyan-500 outline-none font-mono font-bold"
                      >
                        {['S', 'A', 'B', 'C', 'D', 'F'].map(rank => (
                          <option key={rank} value={rank}>{rank} - Rank</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Nutrition Rating Row */}
                  <div>
                    <label className="text-[11px] font-mono text-slate-700 dark:text-slate-300 block mb-1 uppercase font-bold tracking-wider">Nutrition Quality</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['Clean', 'Moderate', 'Poor'] as const).map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setNutrition(rating)}
                          className={`py-1 rounded text-[10px] font-mono font-bold cursor-pointer border transition-all ${
                            nutrition === rating
                              ? rating === 'Clean'
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                                : rating === 'Moderate'
                                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                                : 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400'
                              : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Steps (Optional parameter logged but quick slider) */}
                  <div className="hidden">
                    <input type="hidden" value={steps} onChange={() => {}} />
                  </div>

                  <div className="flex gap-2">
                    <button 
                      type="submit"
                      className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold font-mono text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {saveFeedback ? <Check className="w-4 h-4 animate-bounce" /> : <Edit3 className="w-4 h-4" />}
                      {saveFeedback ? 'Log Committed' : 'Commit Biometrics'}
                    </button>
                    {healthDate === todayStr && (
                      <button 
                        type="button"
                        onClick={handleQuickLog}
                        className="px-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-white dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
                        title="Quick Log Today with Perfect Presets"
                      >
                        1-Tap Log
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Status indicators */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>SYSTEM SYNCED: ON</span>
                <span>SECURE PERSISTENCE ACTIVE</span>
              </div>
            </div>

          </div>

          {/* Bottom row: Correlation Analytics & Exercise optimization rules */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="biological-correlation-row">
            
            {/* Custom SVG Line Chart - Performance & Recovery Correlation */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between text-left" id="performance-chart-card">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200">Bio-Recovery vs. High-Stakes Output</h3>
                  <span className="text-[10px] font-mono text-slate-550 dark:text-slate-400">ANALYSIS: LAST 10 LOGGED DAYS</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Highlighting the cost of recovery debt. Plots subjective Energy Wave (0-10) against Daily Execution Rank (converted score).</p>
                
                {last10Logs.length < 2 ? (
                  <div className="h-44 flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-900/10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs py-8">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                    Insufficient biometric trend logs. Log at least 2 distinct dates to map historical wave correlation.
                  </div>
                ) : (
                  <div className="relative">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto text-slate-300 dark:text-slate-800">
                      {/* X and Y grid lines */}
                      {Array.from({ length: 5 }).map((_, i) => {
                        const y = chartPadding.top + (i * (graphHeight / 4));
                        const val = 10 - i * 2.5;
                        return (
                          <g key={i} className="opacity-45">
                            <line 
                              x1={chartPadding.left} 
                              y1={y} 
                              x2={chartWidth - chartPadding.right} 
                              y2={y} 
                              stroke="currentColor" 
                              strokeWidth="0.5" 
                              strokeDasharray="2,2" 
                            />
                            <text 
                              x={chartPadding.left - 8} 
                              y={y + 3} 
                              fill="currentColor" 
                              fontSize="9" 
                              fontFamily="JetBrains Mono" 
                              textAnchor="end"
                              className="font-bold text-slate-500"
                            >
                              {val}
                            </text>
                          </g>
                        );
                      })}

                      {/* X Dates Labels */}
                      {svgPoints.points.map((p, i) => (
                        <g key={i} className="opacity-70">
                          <line 
                            x1={p.x} 
                            y1={chartPadding.top} 
                            x2={p.x} 
                            y2={chartPadding.top + graphHeight} 
                            stroke="currentColor" 
                            strokeWidth="0.5" 
                            strokeDasharray="4,4" 
                          />
                          <text 
                            x={p.x} 
                            y={chartHeight - chartPadding.bottom + 16} 
                            fill="currentColor" 
                            fontSize="8" 
                            fontFamily="JetBrains Mono" 
                            textAnchor="middle"
                            className="font-bold text-slate-500"
                          >
                            {p.raw.date}
                          </text>
                        </g>
                      ))}

                      {/* Energy Wave Path & Gradient Area */}
                      <path 
                        d={`${svgPoints.energyPath} L ${svgPoints.points[svgPoints.points.length - 1].x} ${chartPadding.top + graphHeight} L ${chartPadding.left} ${chartPadding.top + graphHeight} Z`}
                        fill="url(#energyGrad)"
                        className="opacity-25"
                      />
                      <path 
                        d={svgPoints.energyPath} 
                        fill="none" 
                        stroke="#06b6d4" 
                        strokeWidth="2.5" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_0_4px_rgba(6,182,212,0.3)]"
                      />

                      {/* Execution Performance Path & Area */}
                      <path 
                        d={`${svgPoints.performancePath} L ${svgPoints.points[svgPoints.points.length - 1].x} ${chartPadding.top + graphHeight} L ${chartPadding.left} ${chartPadding.top + graphHeight} Z`}
                        fill="url(#perfGrad)"
                        className="opacity-15"
                      />
                      <path 
                        d={svgPoints.performancePath} 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="2.5" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]"
                      />

                      {/* Interactive Point Markers with accessible data text */}
                      {svgPoints.points.map((p, i) => (
                        <g key={i} className="group cursor-pointer">
                          {/* Energy Circle */}
                          <circle 
                            cx={p.x} 
                            cy={p.ey} 
                            r="4" 
                            fill="#06b6d4" 
                            stroke="#fff" 
                            strokeWidth="1.5" 
                          />
                          <text 
                            x={p.x} 
                            y={p.ey - 7} 
                            fill="#06b6d4" 
                            fontSize="8" 
                            fontFamily="JetBrains Mono" 
                            fontWeight="bold" 
                            textAnchor="middle"
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-black"
                          >
                            ⚡{p.raw.energy}
                          </text>

                          {/* Performance Circle */}
                          <circle 
                            cx={p.x} 
                            cy={p.py} 
                            r="4" 
                            fill="#10b981" 
                            stroke="#fff" 
                            strokeWidth="1.5" 
                          />
                          <text 
                            x={p.x} 
                            y={p.py - 7} 
                            fill="#10b981" 
                            fontSize="8" 
                            fontFamily="JetBrains Mono" 
                            fontWeight="bold" 
                            textAnchor="middle"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {p.raw.deepWork ? `${p.raw.deepWork}h` : 'MIT'}
                          </text>
                        </g>
                      ))}

                      {/* SVG definitions for gradients */}
                      <defs>
                        <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )}
              </div>

              {/* Chart Legend */}
              {last10Logs.length >= 2 && (
                <div className="mt-4 flex gap-6 text-[10px] font-mono font-bold justify-center items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-[#06b6d4] inline-block rounded" />
                    <span className="text-cyan-600 dark:text-cyan-400">SUBJECTIVE ENERGY WAVE</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-[#10b981] inline-block rounded" />
                    <span className="text-emerald-600 dark:text-emerald-400">DAILY EXECUTION SCORE</span>
                  </div>
                </div>
              )}
            </div>

            {/* Exercise & Neural Optimization (The Pillar) */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col justify-between text-left" id="exercise-pillar-card">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Footprints className="w-4 h-4 text-emerald-500" />
                    Exercise & Neural Optimization
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">OPTIMAL ADAPTATION</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Define your active physical rules to promote cellular autophagy, neural plasticity, and cognitive longevity.</p>

                {/* Editable Table */}
                <div className="space-y-2 max-h-[140px] overflow-y-auto mb-4 pr-1">
                  {exercises.map((ex) => (
                    <div 
                      key={ex.id}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="truncate">
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{ex.type}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{ex.goal}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteExercise(ex.id)}
                        className="p-1 hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400 text-slate-400 rounded transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {exercises.length === 0 && (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No active exercise rules specified. Add custom categories below.
                    </div>
                  )}
                </div>

                {/* Add rule inline form */}
                <form onSubmit={handleAddExercise} className="space-y-2 border-t border-slate-200 dark:border-slate-800/80 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text"
                      placeholder="Type e.g. Zone 2 Cardio"
                      value={newExType}
                      onChange={(e) => setNewExType(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1.5 text-[10px] focus:border-cyan-500 outline-none"
                    />
                    <input 
                      type="text"
                      placeholder="Goal e.g. 150 mins / week"
                      value={newExGoal}
                      onChange={(e) => setNewExGoal(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1.5 text-[10px] focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Append Exercise Rule
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* Sticky Persistent Floating Action Button (FAB) for Breathing Reset */}
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={startBreathingCycle}
              className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold font-mono text-xs rounded-full shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-cyan-400/20 group relative overflow-hidden"
              id="sticky-floating-zen-button"
            >
              {/* Pulsing glow aura background */}
              <span className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 duration-500 rounded-full transition-all" />
              <Activity className="w-4 h-4 animate-pulse" />
              <span>ZEN BREATHING</span>
            </button>
          </div>

          {/* Full Screen Interruption Overlay modal for Deep Box Breathing */}
          {isBreathingModalOpen && (
            <div className="fixed inset-0 bg-[#07070a]/98 z-50 flex flex-col justify-between p-8 text-center" id="box-breathing-modal-overlay">
              
              {/* Header */}
              <div className="flex justify-between items-center max-w-2xl mx-auto w-full">
                <div className="flex items-center gap-2 text-left">
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">STILLNESS MODULE</span>
                  <h3 className="text-xs font-mono font-bold text-slate-400">AETHER.OS / SECURE reset</h3>
                </div>
                <button 
                  onClick={stopBreathingCycle}
                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>

              {/* Central Box Breathing Animation Sphere */}
              <div className="max-w-md mx-auto w-full flex flex-col items-center justify-center space-y-12">
                
                {/* Visual breathing sphere helper */}
                <div className="relative flex items-center justify-center">
                  
                  {/* Slow pulsing neon visual ring */}
                  <div className={`absolute w-72 h-72 rounded-full border border-cyan-500/15 transition-all duration-1000 ${
                    breathingPhase === 'inhale' ? 'scale-110 opacity-40 border-cyan-400/30' :
                    breathingPhase === 'hold1' ? 'scale-125 opacity-100 border-cyan-400/50' :
                    breathingPhase === 'exhale' ? 'scale-90 opacity-40 border-cyan-400/20' : 'scale-75 opacity-10 border-cyan-400/10'
                  }`} />

                  {/* Pulsing core sphere */}
                  <div 
                    className={`w-48 h-48 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex flex-col items-center justify-center relative transition-transform duration-1000 ease-in-out shadow-[0_0_50px_rgba(6,182,212,0.3)] ${
                      breathingPhase === 'inhale' ? 'scale-125' :
                      breathingPhase === 'hold1' ? 'scale-125 pulse-glow' :
                      breathingPhase === 'exhale' ? 'scale-95' : 'scale-75'
                    }`}
                  >
                    <span className="text-white font-mono text-3xl font-bold">{breathingSecondsLeft}s</span>
                    <span className="text-white/65 text-[10px] font-mono tracking-widest uppercase font-bold mt-1">
                      {breathingPhase === 'inhale' ? 'Inhale' :
                       breathingPhase === 'hold1' ? 'Hold' :
                       breathingPhase === 'exhale' ? 'Exhale' :
                       breathingPhase === 'hold2' ? 'Hold Empty' : ''}
                    </span>
                  </div>

                </div>

                {/* Descriptive advice block */}
                <div className="space-y-3">
                  <h4 className="text-lg font-display font-semibold text-white tracking-tight">
                    {breathingPhase === 'inhale' && "Breathe in through your nose deeply. Expand your diaphragm."}
                    {breathingPhase === 'hold1' && "Hold your breath. Suspend cognitive thoughts. Relax your neck."}
                    {breathingPhase === 'exhale' && "Exhale slowly through your mouth. Empty your lungs entirely."}
                    {breathingPhase === 'hold2' && "Hold completely empty. Feel the absolute stillness."}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Sustaining 4-second box cycles triggers immediate parasympathetic activation, decreasing blood pressure and centering the prefrontal cortex.
                  </p>
                </div>

                {/* Staggered progress dots */}
                <div className="flex gap-2 justify-center">
                  {(['inhale', 'hold1', 'exhale', 'hold2'] as const).map((phase) => (
                    <span 
                      key={phase} 
                      className={`w-3.5 h-1.5 rounded-full transition-all ${
                        breathingPhase === phase 
                          ? 'bg-cyan-400 w-6' 
                          : 'bg-white/10'
                      }`} 
                    />
                  ))}
                </div>

              </div>

              {/* Footer */}
              <div className="max-w-md mx-auto w-full">
                <button 
                  onClick={stopBreathingCycle}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white border border-white/10 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
                >
                  Exit Stillness Session
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
