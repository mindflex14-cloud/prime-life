import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Activity, 
  Award, 
  Droplets, 
  Dumbbell, 
  Zap,
  Sparkles
} from 'lucide-react';
import PhysicalActivity from './PhysicalActivity';
import RecoveryHydration from './RecoveryHydration';
import ChallengesMissions from './ChallengesMissions';
import AIPerformanceCoach from './AIPerformanceCoach';
import { WorkoutTemplate, DailyWorkout, RecoveryHydrationState, Challenge, GamificationState } from './Types';
import { saveUserDataToCloud } from '../../lib/supabaseSync';

// Initial Mock Blueprints with sections structure
const INITIAL_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 't-master',
    name: 'Master Template',
    schedule: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    warmup: '5 min dynamic stretching, warm up sets',
    cooldown: '10 min static stretching',
    sections: [
      {
        id: 's-1',
        name: 'Chest & Shoulders',
        exercises: [
          { id: 'e-1', name: 'Incline Dumbbell Press', sets: 4, reps: 10, targetWeight: 75, restTime: 120, order: 1, notes: 'Focus on chest stretch' },
          { id: 'e-2', name: 'Lateral Raises', sets: 3, reps: 15, targetWeight: 20, restTime: 60, order: 2, notes: 'Strict form, no swinging' },
        ]
      },
      {
        id: 's-2',
        name: 'Back & Core',
        exercises: [
          { id: 'e-3', name: 'Weighted Pull-ups', sets: 4, reps: 8, targetWeight: 25, restTime: 120, order: 3, notes: 'Full hang to chin-over-bar' },
        ]
      },
      {
        id: 's-3',
        name: 'Leg Power & Conditioning',
        exercises: [
          { id: 'e-4', name: 'Barbell Back Squats', sets: 4, reps: 8, targetWeight: 185, restTime: 150, order: 1, notes: 'Focus on full depth' },
          { id: 'e-5', name: 'Leg Press', sets: 3, reps: 12, targetWeight: 360, restTime: 90, order: 2, notes: 'Controlled tempo' }
        ]
      }
    ]
  }
];

const INITIAL_RECOVERY: RecoveryHydrationState = {
  dailyWaterGoal: 3000,
  waterIntake: 0,
  bottleSize: 600,
  sleepTarget: 8,
  bedtimeGoal: '22:30',
  wakeupGoal: '06:30',
  sleepDuration: 7.2,
  sleepQuality: 8,
  recoveryScore: 85,
  activities: [
    { id: 'ra-1', name: '15 min Foam Rolling', isCompleted: false },
    { id: 'ra-2', name: '10 min Cold Exposure', isCompleted: false },
    { id: 'ra-3', name: '10 min Box Breathing', isCompleted: false },
  ]
};

const INITIAL_CHALLENGES: Challenge[] = [
  { id: 'c-1', name: '75 Hard - Phase 1', goalType: 'daily', targetValue: 75, currentValue: 14, startDate: '2026-06-20', endDate: '2026-09-02', icon: 'zap', color: '#f43f5e' },
  { id: 'c-2', name: '10k Daily Steps', goalType: 'daily', targetValue: 10000, currentValue: 6500, startDate: '2026-07-01', endDate: '2026-07-31', icon: 'activity', color: '#06b6d4' },
];

const INITIAL_GAMIFICATION: GamificationState = {
  xp: 4850,
  level: 12,
  streak: 24,
  badges: ['Early Bird', 'Iron Consistency']
};

export default function BiologicalCommand({ isDarkMode, userId }: { isDarkMode: boolean; userId?: string }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthlyCalendar, setShowMonthlyCalendar] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

  // --- CORE STATE RECONSTRUCTED FOR HISTORY PERSISTENCE ---
  
  // 1. Templates list
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() => {
    const saved = localStorage.getItem('lifeos_vitals_workout_templates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate old templates (Upper/Lower) to the new Master Template if found
        if (parsed.some((t: any) => t.id === 't-1' || t.id === 't-2')) {
          return INITIAL_TEMPLATES;
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TEMPLATES;
  });

  // 2. Workout History Map (dateStr -> DailyWorkout)
  const [workoutHistory, setWorkoutHistory] = useState<Record<string, DailyWorkout>>(() => {
    const saved = localStorage.getItem('lifeos_vitals_workout_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  // 3. Recovery History Map (dateStr -> RecoveryHydrationState)
  const [recoveryHistory, setRecoveryHistory] = useState<Record<string, RecoveryHydrationState>>(() => {
    const saved = localStorage.getItem('lifeos_vitals_recovery_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  // 4. Challenges (Master config/templates)
  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('lifeos_vitals_challenges');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CHALLENGES;
  });

  // 4b. Challenges History Map (dateStr -> Challenge[])
  const [challengesHistory, setChallengesHistory] = useState<Record<string, Challenge[]>>(() => {
    const saved = localStorage.getItem('lifeos_vitals_challenges_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  // 5. Gamification
  const [gamification, setGamification] = useState<GamificationState>(() => {
    const saved = localStorage.getItem('lifeos_vitals_gamification');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_GAMIFICATION;
  });

  // Active Date string representation
  const dateStr = selectedDate.toISOString().split('T')[0];

  // --- COMPONENT LEVEL SYNC LISTENER (Real-time update) ---
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { key, value } = customEvent.detail || {};

      if (key === 'lifeos_vitals_workout_templates') {
        if (value) setTemplates(value);
      } else if (key === 'lifeos_vitals_workout_history') {
        if (value) setWorkoutHistory(value);
      } else if (key === 'lifeos_vitals_recovery_history') {
        if (value) setRecoveryHistory(value);
      } else if (key === 'lifeos_vitals_challenges') {
        if (value) setChallenges(value);
      } else if (key === 'lifeos_vitals_challenges_history') {
        if (value) setChallengesHistory(value);
      } else if (key === 'lifeos_vitals_gamification') {
        if (value) setGamification(value);
      }
    };

    window.addEventListener('local-storage-sync', handleSync);
    return () => {
      window.removeEventListener('local-storage-sync', handleSync);
    };
  }, []);

  // --- CLOUD SYNC TRIGGERS ---
  useEffect(() => {
    localStorage.setItem('lifeos_vitals_workout_templates', JSON.stringify(templates));
    if (userId) {
      saveUserDataToCloud(userId, 'vitalsWorkoutTemplates', templates);
    }
  }, [templates, userId]);

  useEffect(() => {
    localStorage.setItem('lifeos_vitals_workout_history', JSON.stringify(workoutHistory));
    if (userId) {
      saveUserDataToCloud(userId, 'vitalsWorkoutHistory', workoutHistory);
    }
  }, [workoutHistory, userId]);

  useEffect(() => {
    localStorage.setItem('lifeos_vitals_recovery_history', JSON.stringify(recoveryHistory));
    if (userId) {
      saveUserDataToCloud(userId, 'vitalsRecoveryHistory', recoveryHistory);
    }
  }, [recoveryHistory, userId]);

  useEffect(() => {
    localStorage.setItem('lifeos_vitals_challenges', JSON.stringify(challenges));
    if (userId) {
      saveUserDataToCloud(userId, 'vitalsChallenges', challenges);
    }
  }, [challenges, userId]);

  useEffect(() => {
    localStorage.setItem('lifeos_vitals_challenges_history', JSON.stringify(challengesHistory));
    if (userId) {
      saveUserDataToCloud(userId, 'vitalsChallengesHistory', challengesHistory);
    }
  }, [challengesHistory, userId]);

  useEffect(() => {
    localStorage.setItem('lifeos_vitals_gamification', JSON.stringify(gamification));
    if (userId) {
      saveUserDataToCloud(userId, 'vitalsGamification', gamification);
    }
  }, [gamification, userId]);


  // --- CURRENT DAY STATE RESOLUTION ---
  
  // Resolve workout for selected date
  const getActiveWorkout = (): DailyWorkout | null => {
    if (workoutHistory[dateStr]) {
      return workoutHistory[dateStr];
    }
    
    // Get today's local date string YYYY-MM-DD
    const todayLocal = new Date();
    const year = todayLocal.getFullYear();
    const month = String(todayLocal.getMonth() + 1).padStart(2, '0');
    const day = String(todayLocal.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    // For past days, if not explicitly in workoutHistory, keep it as Rest Day to protect history
    if (dateStr < todayStr) {
      return {
        date: dateStr,
        templateId: 'rest',
        sections: [],
        completedSets: {},
        isCompleted: false
      };
    }
    
    // For today and future days, look backwards in workoutHistory to find the closest previous finalized choice
    let activeTemplateId = null;
    const sortedHistoryKeys = Object.keys(workoutHistory)
      .filter(k => k <= dateStr)
      .sort((a, b) => b.localeCompare(a)); // Descending order: closest past date first
      
    for (const key of sortedHistoryKeys) {
      const workout = workoutHistory[key];
      if (workout && workout.templateId) {
        activeTemplateId = workout.templateId;
        break;
      }
    }
    
    // Fallback if no history exists yet
    if (!activeTemplateId) {
      activeTemplateId = templates[0]?.id || 'rest';
    }
    
    if (activeTemplateId === 'rest') {
      return {
        date: dateStr,
        templateId: 'rest',
        sections: [],
        completedSets: {},
        isCompleted: false
      };
    }
    
    let matchedTemplate = templates.find(t => t.id === activeTemplateId);
    if (!matchedTemplate && activeTemplateId !== 'rest') {
      matchedTemplate = templates.find(t => t.id === 't-master') || templates[0];
    }
    
    if (matchedTemplate) {
      return {
        date: dateStr,
        templateId: matchedTemplate.id,
        sections: matchedTemplate.sections.map(s => ({
          ...s,
          exercises: s.exercises.map(ex => ({ ...ex }))
        })),
        completedSets: {},
        isCompleted: false
      };
    }
    
    return {
      date: dateStr,
      templateId: 'rest',
      sections: [],
      completedSets: {},
      isCompleted: false
    };
  };

  const dailyWorkout = getActiveWorkout();

  // Resolve recovery state for selected date with Historical Protection & Smart Fallback
  const getActiveRecovery = (): RecoveryHydrationState => {
    if (recoveryHistory[dateStr]) {
      return recoveryHistory[dateStr];
    }

    // Get today's local date string YYYY-MM-DD
    const todayLocal = new Date();
    const year = todayLocal.getFullYear();
    const month = String(todayLocal.getMonth() + 1).padStart(2, '0');
    const day = String(todayLocal.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // For past days, return a blank rest state to protect history
    if (dateStr < todayStr) {
      return {
        ...INITIAL_RECOVERY,
        waterIntake: 0,
        sleepDuration: 0,
        sleepQuality: 0,
        recoveryScore: 0,
        activities: INITIAL_RECOVERY.activities.map(act => ({ ...act, isCompleted: false }))
      };
    }

    // For today/future, look backward in recoveryHistory to find the closest previous settings/goals
    let resolvedGoals = {
      dailyWaterGoal: INITIAL_RECOVERY.dailyWaterGoal,
      bottleSize: INITIAL_RECOVERY.bottleSize,
      sleepTarget: INITIAL_RECOVERY.sleepTarget,
      bedtimeGoal: INITIAL_RECOVERY.bedtimeGoal,
      wakeupGoal: INITIAL_RECOVERY.wakeupGoal,
    };

    const sortedKeys = Object.keys(recoveryHistory)
      .filter(k => k <= dateStr)
      .sort((a, b) => b.localeCompare(a));

    for (const key of sortedKeys) {
      const rec = recoveryHistory[key];
      if (rec) {
        resolvedGoals = {
          dailyWaterGoal: rec.dailyWaterGoal || INITIAL_RECOVERY.dailyWaterGoal,
          bottleSize: rec.bottleSize || INITIAL_RECOVERY.bottleSize,
          sleepTarget: rec.sleepTarget || INITIAL_RECOVERY.sleepTarget,
          bedtimeGoal: rec.bedtimeGoal || INITIAL_RECOVERY.bedtimeGoal,
          wakeupGoal: rec.wakeupGoal || INITIAL_RECOVERY.wakeupGoal,
        };
        break;
      }
    }

    return {
      ...resolvedGoals,
      waterIntake: 0,
      sleepDuration: 0,
      sleepQuality: 0,
      recoveryScore: 0,
      activities: INITIAL_RECOVERY.activities.map(act => ({ ...act, isCompleted: false }))
    };
  };

  const recoveryState = getActiveRecovery();

  // Resolve challenges for selected date with Historical Protection & Smart Fallback
  const getActiveChallenges = (): Challenge[] => {
    if (challengesHistory[dateStr]) {
      return challengesHistory[dateStr];
    }

    // Get today's local date string YYYY-MM-DD
    const todayLocal = new Date();
    const year = todayLocal.getFullYear();
    const month = String(todayLocal.getMonth() + 1).padStart(2, '0');
    const day = String(todayLocal.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // For past days, return challenges with 0 progress to protect history
    if (dateStr < todayStr) {
      return challenges.map(c => ({
        ...c,
        currentValue: 0
      }));
    }

    // For today/future, look backward in challengesHistory to find the closest previous day's setup
    const sortedKeys = Object.keys(challengesHistory)
      .filter(k => k <= dateStr)
      .sort((a, b) => b.localeCompare(a));

    for (const key of sortedKeys) {
      const hist = challengesHistory[key];
      if (hist && hist.length > 0) {
        return hist.map(c => ({
          ...c,
          currentValue: 0 // Reset daily progress for forward scheduling
        }));
      }
    }

    // Fallback to active challenges template list with 0 progress
    return challenges.map(c => ({
      ...c,
      currentValue: 0
    }));
  };

  const dailyChallenges = getActiveChallenges();


  // --- UPDATE HANDLERS ---
  const handleUpdateWorkout = (updatedWorkout: DailyWorkout) => {
    setWorkoutHistory(prev => ({
      ...prev,
      [dateStr]: updatedWorkout
    }));
  };

  const handleDeleteWorkout = () => {
    setWorkoutHistory(prev => ({
      ...prev,
      [dateStr]: {
        date: dateStr,
        templateId: 'rest',
        sections: [],
        completedSets: {},
        isCompleted: false
      }
    }));
  };

  const handleUpdateRecovery = (action: React.SetStateAction<RecoveryHydrationState>) => {
    setRecoveryHistory(prev => {
      const current = prev[dateStr] || {
        ...INITIAL_RECOVERY,
        waterIntake: 0,
        sleepDuration: 0,
        sleepQuality: 0,
        recoveryScore: 0,
        activities: INITIAL_RECOVERY.activities.map(act => ({ ...act, isCompleted: false }))
      };
      const next = typeof action === 'function' ? (action as Function)(current) : action;
      return {
        ...prev,
        [dateStr]: next
      };
    });
  };

  const handleUpdateChallenges = (updatedChallenges: Challenge[]) => {
    setChallengesHistory(prev => ({
      ...prev,
      [dateStr]: updatedChallenges
    }));
    setChallenges(updatedChallenges); // Keeps the master config templates current
  };


  // --- WEEK DATES GENERATION FOR TOP STRIP ---
  const generateWeek = () => {
    const week = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + i);
      week.push(d);
    }
    return week;
  };
  const weekDates = generateWeek();

  // Calculate readiness score (derived from recovery metrics and sleep)
  const readinessScore = Math.round(
    Math.min(
      60 + 
      (recoveryState.sleepDuration / Math.max(recoveryState.sleepTarget, 1)) * 25 + 
      (recoveryState.waterIntake / Math.max(recoveryState.dailyWaterGoal, 1)) * 10 + 
      (recoveryState.activities.filter(a => a.isCompleted).length * 5),
      100
    )
  );
  
  const readinessLabel = readinessScore > 90 ? 'Peak' : readinessScore > 75 ? 'Optimal' : 'Standard';
  const readinessColor = readinessScore > 90 ? 'text-purple-400' : 'text-cyan-400';

  // --- MONTHLY CALENDAR RENDER HELPERS ---
  const handleMonthPrev = () => {
    setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1));
  };

  const handleMonthNext = () => {
    setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1));
  };

  const generateMonthDays = () => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const cells = [];
    // Padding for days of week before first day of month
    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }
    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      cells.push(new Date(year, month, day));
    }
    return cells;
  };

  return (
    <div className="space-y-12 pb-24 animate-fadeIn" id="biological-command-page">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-4xl font-bold tracking-tight font-sans ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Apex Bio-Command
        </h1>
        <p className={`max-w-2xl text-sm md:text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Human Performance Command Center. Manage your physical output, physiological restoration, and execution parameters.
        </p>
      </div>

      {/* Top Section: Calendar strip with Monthly Option Button */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Daily Protocol Tracker Bar */}
        <div className={`flex-1 glass-panel p-6 rounded-2xl flex flex-col justify-center ${isDarkMode ? 'border-white/5 bg-slate-900/60' : 'border-slate-200 bg-white/60 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className={`font-bold text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>Daily Protocol Tracker</h3>
              <span className="text-slate-500 text-xs font-mono mt-0.5 block">{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
            
            {/* MONTHLY CALENDAR TOGGLE TRIGGER */}
            <button 
              onClick={() => {
                setCalendarViewDate(new Date(selectedDate));
                setShowMonthlyCalendar(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                isDarkMode 
                  ? 'bg-slate-950/80 border-cyan-500/30 hover:border-cyan-400 text-cyan-400' 
                  : 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100 text-cyan-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Monthly Calendar
            </button>
          </div>

          <div className="flex items-center justify-between overflow-x-auto gap-2">
            <button 
              onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }}
              className={`p-2 rounded-xl transition-colors shrink-0 ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 md:gap-4 flex-1 justify-center min-w-[500px]">
              {weekDates.map((date, i) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                
                const lookupStr = date.toISOString().split('T')[0];
                const histWorkout = workoutHistory[lookupStr];
                const histRecovery = recoveryHistory[lookupStr];
                
                // Indicators
                const physicalCompleted = histWorkout?.isCompleted;
                const recoveryStarted = histRecovery && (histRecovery.waterIntake > 0 || histRecovery.activities.some(a => a.isCompleted));

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all min-w-[65px] ${
                      isSelected 
                        ? isDarkMode ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-bold' : 'bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold'
                        : isDarkMode ? 'hover:bg-slate-800 border border-transparent text-slate-400' : 'hover:bg-slate-100 border border-transparent text-slate-600'
                    }`}
                  >
                    <span className="text-[9px] font-mono uppercase tracking-widest mb-1">
                      {date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 3)}
                    </span>
                    <span className={`text-lg font-bold ${isSelected ? (isDarkMode ? 'text-cyan-400' : 'text-cyan-600') : isToday ? (isDarkMode ? 'text-white' : 'text-slate-900') : (isDarkMode ? 'text-slate-300' : 'text-slate-500')}`}>
                      {date.getDate()}
                    </span>
                    
                    {/* Status dots */}
                    <div className="flex gap-1 mt-1.5">
                      <div className={`w-1 h-1 rounded-full ${physicalCompleted ? 'bg-emerald-400' : histWorkout ? 'bg-cyan-400' : 'bg-slate-700/50'}`} />
                      <div className={`w-1 h-1 rounded-full ${recoveryStarted ? 'bg-blue-400' : 'bg-slate-700/50'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }}
              className={`p-2 rounded-xl transition-colors shrink-0 ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Daily Readiness Score Column */}
        <div className={`w-full lg:w-72 glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group ${isDarkMode ? 'border-white/5 bg-slate-900/60' : 'border-slate-200 bg-white/60 shadow-sm'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-50 pointer-events-none" />
          <span className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-2 relative z-10">Daily Readiness</span>
          <div className="flex items-baseline gap-1 relative z-10 mb-1">
            <span className={`text-5xl font-bold tracking-tighter ${readinessColor}`}>{readinessScore}</span>
            <span className="text-xl text-slate-500 font-medium">/100</span>
          </div>
          <div className="flex items-center gap-1.5 relative z-10">
            <div className={`w-2 h-2 rounded-full ${readinessScore > 85 ? 'bg-purple-400' : 'bg-cyan-400'} animate-pulse`} />
            <span className={`text-xs font-semibold ${readinessScore > 85 ? (isDarkMode ? 'text-purple-400' : 'text-purple-600') : (isDarkMode ? 'text-cyan-400' : 'text-cyan-600')}`}>{readinessLabel} State</span>
          </div>
        </div>
      </div>

      {/* MONTHLY CALENDAR MODAL VIEW */}
      <AnimatePresence>
        {showMonthlyCalendar && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-3xl border p-6 space-y-4 ${
                isDarkMode ? 'bg-slate-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
              }`}
            >
              {/* Header with Nav */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Protocol Monthly Map</h3>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mt-0.5 block">Select day to jump</span>
                </div>
                <button 
                  onClick={() => setShowMonthlyCalendar(false)}
                  className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Month Selector Buttons */}
              <div className="flex items-center justify-between border-y border-slate-800/50 py-2">
                <button onClick={handleMonthPrev} className="p-1.5 hover:bg-slate-800/40 rounded-lg">
                  <ChevronLeft className="w-5 h-5 text-slate-400" />
                </button>
                <span className="font-bold font-mono uppercase text-sm text-cyan-400">
                  {calendarViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={handleMonthNext} className="p-1.5 hover:bg-slate-800/40 rounded-lg">
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Day of Week Labels */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {generateMonthDays().map((dateItem, idx) => {
                  if (!dateItem) return <div key={`empty-${idx}`} />;
                  
                  const cellStr = dateItem.toISOString().split('T')[0];
                  const histWorkout = workoutHistory[cellStr];
                  const histRecovery = recoveryHistory[cellStr];
                  
                  const isSelected = dateItem.toDateString() === selectedDate.toDateString();
                  const isToday = dateItem.toDateString() === new Date().toDateString();

                  // Indicators
                  const physicalCompleted = histWorkout?.isCompleted;
                  const physicalStarted = histWorkout && histWorkout.sections.length > 0;
                  const recoveryCompleted = histRecovery && histRecovery.waterIntake >= histRecovery.dailyWaterGoal && histRecovery.activities.every(a => a.isCompleted);
                  const recoveryStarted = histRecovery && (histRecovery.waterIntake > 0 || histRecovery.activities.some(a => a.isCompleted));

                  return (
                    <button
                      key={cellStr}
                      onClick={() => {
                        setSelectedDate(dateItem);
                        setShowMonthlyCalendar(false);
                      }}
                      className={`h-11 rounded-lg flex flex-col items-center justify-center relative border text-xs transition-all ${
                        isSelected 
                          ? isDarkMode ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-400 font-bold' : 'bg-cyan-100 border-cyan-400 text-cyan-800 font-bold'
                          : isToday
                            ? isDarkMode ? 'bg-slate-800/60 border-slate-700 text-white font-bold' : 'bg-slate-100 border-slate-300 text-slate-900 font-bold'
                            : isDarkMode ? 'bg-slate-950/20 border-transparent text-slate-400 hover:bg-slate-800/30' : 'bg-slate-50/40 border-transparent text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{dateItem.getDate()}</span>
                      
                      {/* Dots underneath */}
                      <div className="flex gap-0.5 mt-0.5">
                        <div className={`w-1 h-1 rounded-full ${
                          physicalCompleted ? 'bg-emerald-400' : physicalStarted ? 'bg-cyan-500' : 'bg-slate-800'
                        }`} />
                        <div className={`w-1 h-1 rounded-full ${
                          recoveryCompleted ? 'bg-blue-400' : recoveryStarted ? 'bg-cyan-600' : 'bg-slate-800'
                        }`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer Legend */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800/50">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Workout Done</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span>Started</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>Recovery Logged</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stacked functional pages */}
      <div className="space-y-12">
        
        {/* Physical Activity Component */}
        <section className="scroll-mt-6" id="physical-activity">
          <PhysicalActivity 
            templates={templates} 
            setTemplates={setTemplates}
            dailyWorkout={dailyWorkout}
            setDailyWorkout={handleUpdateWorkout}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            isDarkMode={isDarkMode}
            onUpdateWorkout={handleUpdateWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            workoutHistory={workoutHistory}
            setWorkoutHistory={setWorkoutHistory}
          />
        </section>

        {/* Recovery & Hydration Checklist Component */}
        <section className="scroll-mt-6" id="recovery-hydration">
          <RecoveryHydration 
            state={recoveryState}
            setState={handleUpdateRecovery}
            isDarkMode={isDarkMode}
          />
        </section>

        {/* Challenges & Missions Component */}
        <section className="scroll-mt-6" id="challenges-missions">
          <ChallengesMissions 
            challenges={dailyChallenges}
            setChallenges={handleUpdateChallenges}
            gamification={gamification}
            setGamification={setGamification}
            isDarkMode={isDarkMode}
          />
        </section>

      </div>

      {/* AI Coach Feedback Block */}
      <div className={`pt-8 mt-12 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`} id="ai-coach">
        <AIPerformanceCoach 
          dailyWorkout={dailyWorkout}
          recoveryState={recoveryState}
          challenges={dailyChallenges}
          isDarkMode={isDarkMode}
        />
      </div>

    </div>
  );
}
