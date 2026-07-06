import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import PhysicalActivity from './PhysicalActivity';
import RecoveryHydration from './RecoveryHydration';
import ChallengesMissions from './ChallengesMissions';
import AIPerformanceCoach from './AIPerformanceCoach';
import { WorkoutTemplate, DailyWorkout, RecoveryHydrationState, Challenge, GamificationState } from './Types';

// Initial Mock Data
const INITIAL_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 't-1',
    name: 'Upper Body Hypertrophy',
    schedule: ['Monday', 'Thursday'],
    warmup: '5 min dynamic stretching, 2 sets light pushups',
    cooldown: '10 min static stretching',
    exercises: [
      { id: 'e-1', name: 'Incline Dumbbell Press', sets: 4, reps: 10, targetWeight: 75, restTime: 120, order: 1, notes: 'Focus on stretch' },
      { id: 'e-2', name: 'Weighted Pull-ups', sets: 4, reps: 8, targetWeight: 25, restTime: 120, order: 2, notes: 'Full range of motion' },
      { id: 'e-3', name: 'Lateral Raises', sets: 3, reps: 15, targetWeight: 20, restTime: 60, order: 3, notes: 'Strict form' },
    ]
  }
];

const INITIAL_RECOVERY: RecoveryHydrationState = {
  dailyWaterGoal: 3000,
  waterIntake: 1200,
  bottleSize: 600,
  sleepTarget: 8,
  bedtimeGoal: '22:30',
  wakeupGoal: '06:30',
  sleepDuration: 7.2,
  sleepQuality: 8,
  recoveryScore: 85,
  activities: [
    { id: 'ra-1', name: '15 min Foam Rolling', isCompleted: false },
    { id: 'ra-2', name: '10 min Cold Exposure', isCompleted: true },
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

export default function BiologicalCommand({ isDarkMode }: { isDarkMode: boolean }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(INITIAL_TEMPLATES);
  const [dailyWorkout, setDailyWorkout] = useState<DailyWorkout | null>({
    date: new Date().toISOString().split('T')[0],
    templateId: 't-1',
    completedSets: { 'e-2': 4, 'e-3': 1 },
    isCompleted: false
  });
  
  const [recoveryState, setRecoveryState] = useState<RecoveryHydrationState>(INITIAL_RECOVERY);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [gamification, setGamification] = useState<GamificationState>(INITIAL_GAMIFICATION);

  // Sync to local storage would happen here in a real app
  useEffect(() => {
    // Check if workout is completely done based on template
    if (dailyWorkout && !dailyWorkout.isCompleted) {
      const template = templates.find(t => t.id === dailyWorkout.templateId);
      if (template) {
        const isAllDone = template.exercises.every(e => 
          (dailyWorkout.completedSets[e.id] || 0) >= e.sets
        );
        if (isAllDone) {
          setDailyWorkout(prev => prev ? { ...prev, isCompleted: true } : prev);
        }
      }
    }
  }, [dailyWorkout, templates]);

  // Generate week dates
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

  // Mock score based on selected date
  const readinessScore = selectedDate.getDate() % 2 === 0 ? 85 : 92;
  const readinessLabel = readinessScore > 90 ? 'Peak' : 'Optimal';
  const readinessColor = readinessScore > 90 ? 'text-purple-400' : 'text-cyan-400';

  return (
    <div className="space-y-12 pb-24 animate-fadeIn" id="biological-command-page">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-4xl font-bold tracking-tight font-sans ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Biological Command
        </h1>
        <p className={`max-w-2xl text-sm md:text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Human Performance Command Center. Manage your physical output, physiological restoration, and execution parameters.
        </p>
      </div>

      {/* Top Section: Calendar & Daily Readiness */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Strip */}
        <div className={`flex-1 glass-panel p-6 rounded-2xl flex flex-col justify-center ${isDarkMode ? 'border-white/5 bg-slate-900/60' : 'border-slate-200 bg-white/60 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Daily Protocol Tracker</h3>
            <span className="text-slate-500 text-sm font-mono">{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
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
                
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all min-w-[65px] ${
                      isSelected 
                        ? isDarkMode ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400' : 'bg-cyan-50 border border-cyan-200 text-cyan-600'
                        : isDarkMode ? 'hover:bg-slate-800 border border-transparent text-slate-400' : 'hover:bg-slate-100 border border-transparent text-slate-600'
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-widest mb-1">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className={`text-lg font-bold ${isSelected ? (isDarkMode ? 'text-cyan-400' : 'text-cyan-600') : isToday ? (isDarkMode ? 'text-white' : 'text-slate-900') : (isDarkMode ? 'text-slate-300' : 'text-slate-500')}`}>
                      {date.getDate()}
                    </span>
                    
                    {/* Tiny dots representing Physical, Recovery, Missions status */}
                    <div className="flex gap-1 mt-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${date.getDate() % 2 === 0 ? 'bg-cyan-500' : (isDarkMode ? 'bg-slate-700' : 'bg-slate-300')}`} />
                      <div className={`w-1.5 h-1.5 rounded-full ${date.getDate() % 3 !== 0 ? 'bg-blue-500' : (isDarkMode ? 'bg-slate-700' : 'bg-slate-300')}`} />
                      <div className={`w-1.5 h-1.5 rounded-full ${date.getDate() % 4 !== 0 ? 'bg-rose-500' : (isDarkMode ? 'bg-slate-700' : 'bg-slate-300')}`} />
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

        {/* Daily Readiness Score */}
        <div className={`w-full lg:w-72 glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group ${isDarkMode ? 'border-white/5 bg-slate-900/60' : 'border-slate-200 bg-white/60 shadow-sm'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-50" />
          <span className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-2 relative z-10">Daily Readiness</span>
          <div className="flex items-baseline gap-1 relative z-10 mb-1">
            <span className={`text-5xl font-bold tracking-tighter ${readinessColor}`}>{readinessScore}</span>
            <span className="text-xl text-slate-500 font-medium">/100</span>
          </div>
          <div className="flex items-center gap-1.5 relative z-10">
            <div className={`w-2 h-2 rounded-full ${readinessScore > 90 ? 'bg-purple-400' : 'bg-cyan-400'} animate-pulse`} />
            <span className={`text-sm font-medium ${readinessScore > 90 ? (isDarkMode ? 'text-purple-400' : 'text-purple-600') : (isDarkMode ? 'text-cyan-400' : 'text-cyan-600')}`}>{readinessLabel} State</span>
          </div>
        </div>
      </div>

      {/* Main Sections Stacked */}
      <div className="space-y-12">
        {/* Physical Activity Section */}
        <section className="scroll-mt-6" id="physical-activity">
          <PhysicalActivity 
            templates={templates} 
            setTemplates={setTemplates}
            dailyWorkout={dailyWorkout}
            setDailyWorkout={setDailyWorkout}
            isDarkMode={isDarkMode}
          />
        </section>
        
        {/* Recovery & Hydration Section */}
        <section className="scroll-mt-6" id="recovery-hydration">
          <RecoveryHydration 
            state={recoveryState}
            setState={setRecoveryState}
            isDarkMode={isDarkMode}
          />
        </section>

        {/* Challenges & Missions Section */}
        <section className="scroll-mt-6" id="challenges-missions">
          <ChallengesMissions 
            challenges={challenges}
            setChallenges={setChallenges}
            gamification={gamification}
            setGamification={setGamification}
            isDarkMode={isDarkMode}
          />
        </section>
      </div>

      {/* Bottom Section: AI Coach */}
      <div className={`pt-8 mt-12 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`} id="ai-coach">
        <AIPerformanceCoach 
          dailyWorkout={dailyWorkout}
          recoveryState={recoveryState}
          challenges={challenges}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
}
