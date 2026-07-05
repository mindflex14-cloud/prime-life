import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Compass, 
  Flame, 
  Activity, 
  Droplet, 
  TrendingUp, 
  CheckCircle, 
  Target, 
  ChevronRight, 
  Play, 
  Plus, 
  Heart, 
  Briefcase, 
  DollarSign, 
  Users, 
  BookOpen, 
  Smile, 
  TreePine, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Goal, Milestone, Task, Habit, HealthLog, LifeWheel, UserProfile, FinancialRecord } from '../types';
import { DAILY_QUOTES } from '../data';

interface DashboardProps {
  goals: Goal[];
  milestones: Milestone[];
  tasks: Task[];
  habits: Habit[];
  healthLogs: Record<string, HealthLog>;
  lifeWheel: LifeWheel;
  profile: UserProfile;
  financeRecords: FinancialRecord[];
  updateLifeWheel: (wheel: LifeWheel) => void;
  updateHealthLog: (date: string, log: Partial<HealthLog>) => void;
  onNavigate: (tab: string) => void;
  onStartTimer: (task: Task) => void;
}

export default function Dashboard({
  goals,
  milestones,
  tasks,
  habits,
  healthLogs,
  lifeWheel,
  profile,
  financeRecords,
  updateLifeWheel,
  updateHealthLog,
  onNavigate,
  onStartTimer
}: DashboardProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayHealth = healthLogs[todayStr] || { steps: 0, waterIntake: 0, sleepHours: 0, energyLevel: 0 };

  // Today's dynamic operating state based on Rude Reality Engine
  const todayEnergyRaw = todayHealth.energyLevel || 0;
  const todayEnergy = todayEnergyRaw > 5 ? todayEnergyRaw : todayEnergyRaw * 2;
  const todaySleep = todayHealth.sleepHours || 0;
  const todayStress = (todayHealth as any).stressLevel || 2;
  const todayCups = (todayHealth as any).hydrationCups !== undefined 
    ? (todayHealth as any).hydrationCups 
    : (todayHealth.waterIntake ? Math.round(todayHealth.waterIntake / 250) : 0);

  const getDynamicOperatingState = () => {
    const isBlank = !todayHealth.steps && !todayHealth.sleepHours && !todayHealth.waterIntake && !todayHealth.energyLevel;
    if (isBlank) {
      return {
        label: 'OPERATING STATE: SYSTEM IN THE BLIND',
        class: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
        mode: 'UNKNOWN',
        title: 'Biometric Blackout',
        summary: 'No biometric data logged for today.'
      };
    }
    if (todaySleep < 6.5) {
      return {
        label: 'OPERATING STATE: FORCE RECOVERY MODE',
        class: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse',
        mode: 'RECOVERY',
        title: 'Critical Sleep Depreciation',
        summary: `Operating on a massive sleep deficit of ${todaySleep}h.`
      };
    }
    if (todayStress >= 4) {
      return {
        label: 'OPERATING STATE: FORCE RECOVERY MODE',
        class: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse',
        mode: 'RECOVERY',
        title: 'Critical Sympathetic Load',
        summary: 'Cortisol indicator shows excessive fight-or-flight.'
      };
    }
    if (todayCups < 6) {
      return {
        label: 'OPERATING STATE: RECOVERY ENFORCED',
        class: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
        mode: 'RECOVERY',
        title: 'Severe Dehydration',
        summary: `Hydration level stands at only ${todayCups} cups.`
      };
    }
    if (todayEnergy >= 8 && todaySleep >= 7.5 && todayStress <= 2) {
      return {
        label: 'OPERATING STATE: OPTIMAL PERFORMANCE MODE',
        class: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        mode: 'OPTIMAL',
        title: 'Peak Performance Mode',
        summary: 'Nervous system balance achieved. Ready for strategy sprints.'
      };
    }
    return {
      label: 'OPERATING STATE: MODERATE OPERATING MODE',
      class: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      mode: 'BALANCED',
      title: 'Standard Steady State',
      summary: 'System biometrics are stable. Normal capacity verified.'
    };
  };

  const opState = getDynamicOperatingState();

  // Quote
  const quote = DAILY_QUOTES[profile.dailyQuoteIndex % DAILY_QUOTES.length] || DAILY_QUOTES[0];

  // Calculations
  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;
  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;

  const todayTasks = tasks.filter(t => t.date === todayStr);
  const completedTodayTasks = todayTasks.filter(t => t.status === 'completed').length;

  // Active MIT (Highest Priority pending task today)
  const mit = todayTasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return 0;
    })[0];

  // Finance today
  const todayFinance = financeRecords.filter(f => f.date === todayStr);
  const todayIncome = todayFinance.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
  const todayExpense = todayFinance.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);

  // Wheel of Life angles & labels
  const dimensions: { key: keyof LifeWheel; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'career', label: 'Career', icon: <Briefcase className="w-4 h-4" />, color: 'stroke-cyan-400 text-cyan-400' },
    { key: 'finance', label: 'Finance', icon: <DollarSign className="w-4 h-4" />, color: 'stroke-teal-400 text-teal-400' },
    { key: 'health', label: 'Health', icon: <Heart className="w-4 h-4" />, color: 'stroke-emerald-400 text-emerald-400' },
    { key: 'relationships', label: 'Relations', icon: <Users className="w-4 h-4" />, color: 'stroke-blue-400 text-blue-400' },
    { key: 'personalGrowth', label: 'Growth', icon: <Sparkles className="w-4 h-4" />, color: 'stroke-indigo-400 text-indigo-400' },
    { key: 'fun', label: 'Fun/Play', icon: <Smile className="w-4 h-4" />, color: 'stroke-yellow-400 text-yellow-400' },
    { key: 'environment', label: 'Environ', icon: <TreePine className="w-4 h-4" />, color: 'stroke-green-400 text-green-400' },
    { key: 'spirituality', label: 'Spirit', icon: <Compass className="w-4 h-4" />, color: 'stroke-purple-400 text-purple-400' }
  ];

  // Life Balance Index
  const lifeBalanceIndex = Math.round(
    Object.values(lifeWheel).reduce((sum, v) => sum + v, 0) / 8 * 10
  );

  // Radar chart points computation
  const centerX = 120;
  const centerY = 120;
  const maxRadius = 80;

  const getPoints = (wheel: LifeWheel) => {
    return dimensions.map((dim, i) => {
      const rating = wheel[dim.key];
      const angle = (i * Math.PI) / 4 - Math.PI / 2;
      const radius = (rating / 10) * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const pointsStr = getPoints(lifeWheel);

  const getGridPoints = (level: number) => {
    return dimensions.map((_, i) => {
      const angle = (i * Math.PI) / 4 - Math.PI / 2;
      const radius = (level / 10) * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const handleRatingChange = (key: keyof LifeWheel, change: number) => {
    const newValue = Math.min(10, Math.max(1, lifeWheel[key] + change));
    updateLifeWheel({ ...lifeWheel, [key]: newValue });
  };

  // Water Intake animation
  const handleAddWater = () => {
    updateHealthLog(todayStr, {
      waterIntake: todayHealth.waterIntake + 250
    });
  };

  const waterTarget = 3000;
  const waterProgress = Math.min(100, (todayHealth.waterIntake / waterTarget) * 100);

  return (
    <div className="space-y-6" id="dashboard-main">
      {/* 1. Profile and Quote Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-hero">
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden" id="dashboard-welcome">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none glow-bg-1" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none glow-bg-2" />
          
          <div className="z-10">
            <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border font-bold ${opState.class}`}>
              {opState.label}
            </span>
            <h1 className="text-2xl md:text-3xl font-display font-medium text-slate-800 dark:text-slate-100 mt-4 tracking-tight">
              Welcome back, <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{profile.name}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
 
          <div className="mt-6 border-t border-slate-200 dark:border-slate-800/80 pt-4 z-10">
            <p className="text-slate-700 dark:text-slate-300 italic font-medium text-sm md:text-base leading-relaxed">
              "{quote.text}"
            </p>
            <p className="text-cyan-600 dark:text-cyan-400 text-xs font-mono mt-1 text-right">
              — {quote.author}
            </p>
          </div>
        </div>
 
        {/* Core Vitals Radar/Overview */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden" id="dashboard-balance-index">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-slate-500 dark:text-slate-400 text-xs font-mono uppercase tracking-wider">Life Balance Index</h3>
              <p className="text-4xl font-display font-bold text-emerald-600 dark:text-emerald-400 mt-1">{lifeBalanceIndex}%</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Goal Progress:</span>
              <span className="font-mono text-slate-700 dark:text-slate-200">{completedGoals}/{totalGoals} Completed</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-900/60 h-1.5 rounded-full mt-1 overflow-hidden border border-slate-300 dark:border-slate-800">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${totalGoals ? (completedGoals / totalGoals) * 100 : 0}%` }}
              />
            </div>
          </div>
 
          <button 
            onClick={() => onNavigate('goals')}
            className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            Review Goal Blueprints <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Interactive MIT & Wheel of Life Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-interactive">
        
        {/* SVG Interactive Wheel of Life */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between" id="wheel-of-life-widget">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200">Wheel of Life</h3>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">8 Dimensions</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Click -/+ below to balance your daily fulfillment ratings.</p>
          </div>

          <div className="flex justify-center my-2 relative">
            <svg width="240" height="240" viewBox="0 0 240 240" className="drop-shadow-lg text-slate-200 dark:text-slate-800/60">
              {/* Grid circles */}
              <polygon points={getGridPoints(10)} fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800/50" />
              <polygon points={getGridPoints(8)} fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800/50" />
              <polygon points={getGridPoints(6)} fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800/50" />
              <polygon points={getGridPoints(4)} fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800/50" />
              <polygon points={getGridPoints(2)} fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800/50" />
              
              {/* Axises */}
              {dimensions.map((_, i) => {
                const angle = (i * Math.PI) / 4 - Math.PI / 2;
                const x = centerX + maxRadius * Math.cos(angle);
                const y = centerY + maxRadius * Math.sin(angle);
                return (
                  <line 
                    key={i} 
                    x1={centerX} 
                    y1={centerY} 
                    x2={x} 
                    y2={y} 
                    stroke="currentColor" 
                    strokeWidth="1" 
                    className="text-slate-200 dark:text-slate-800/60"
                  />
                );
              })}

              {/* Radar Area Filled */}
              <polygon 
                points={pointsStr} 
                fill="url(#radarGradient)" 
                stroke="rgba(6, 182, 212, 0.6)" 
                strokeWidth="1.5"
                className="transition-all duration-300"
              />

              {/* Dots on points */}
              {dimensions.map((dim, i) => {
                const rating = lifeWheel[dim.key];
                const angle = (i * Math.PI) / 4 - Math.PI / 2;
                const radius = (rating / 10) * maxRadius;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                return (
                  <circle 
                    key={dim.key} 
                    cx={x} 
                    cy={y} 
                    r="3.5" 
                    className="fill-cyan-500 dark:fill-cyan-400 stroke-white dark:stroke-slate-950 stroke-2 transition-all duration-300" 
                  />
                );
              })}

              {/* Outer labels */}
              {dimensions.map((dim, i) => {
                const angle = (i * Math.PI) / 4 - Math.PI / 2;
                // Offset label slightly outward
                const radius = maxRadius + 16;
                const x = centerX + radius * Math.cos(angle) - 16;
                const y = centerY + radius * Math.sin(angle) + 4;
                return (
                  <text 
                    key={dim.key} 
                    x={x} 
                    y={y} 
                    fill="currentColor" 
                    fontSize="9" 
                    fontFamily="Space Grotesk"
                    className="font-medium text-slate-500 dark:text-slate-400"
                  >
                    {dim.label}
                  </text>
                );
              })}

              {/* Gradients */}
              <defs>
                <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.1)" />
                  <stop offset="100%" stopColor="rgba(6, 182, 212, 0.35)" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Quick rating editors */}
          <div className="grid grid-cols-2 gap-2 mt-4 max-h-36 overflow-y-auto pr-1">
            {dimensions.map((dim) => (
              <div key={dim.key} className="flex items-center justify-between p-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <span className="flex items-center gap-1 font-display text-slate-700 dark:text-slate-300 truncate">
                  {dim.icon}
                  {dim.label}
                </span>
                <div className="flex items-center gap-1 ml-1 shrink-0">
                  <button 
                    onClick={() => handleRatingChange(dim.key, -1)}
                    className="w-4 h-4 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 w-4 text-center font-semibold">{lifeWheel[dim.key]}</span>
                  <button 
                    onClick={() => handleRatingChange(dim.key, 1)}
                    className="w-4 h-4 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily MIT & Habits Spotlight */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between lg:col-span-2" id="mit-spotlight-widget">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                Focus & Execution Spotlight
              </h3>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {completedTodayTasks}/{todayTasks.length} Completed
              </span>
            </div>

            {/* MIT Spot */}
            {mit ? (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-100 to-cyan-50/50 dark:from-slate-900/80 dark:to-cyan-950/20 border border-slate-200 dark:border-cyan-500/20 relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 p-3 text-[10px] font-mono tracking-widest text-cyan-600 dark:text-cyan-400 uppercase font-bold">
                  Active Focus MIT
                </div>
                <div className="pr-16">
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                    {mit.priority} priority
                  </span>
                  <h4 className="text-base font-display font-medium text-slate-800 dark:text-slate-100 mt-2.5 line-clamp-2">
                    {mit.title}
                  </h4>
                  {mit.goalId && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline" />
                      {goals.find(g => g.id === mit.goalId)?.title || "Associated Goal"}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Pomodoros: {mit.pomodorosCompleted} / {mit.pomodorosEstimated}
                    </span>
                  </div>
                  <button 
                    onClick={() => onStartTimer(mit)}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Focus Mode
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center mb-6 py-8">
                <p className="text-slate-600 dark:text-slate-400 text-sm">All of today's priority tasks are completed or scheduled!</p>
                <button 
                  onClick={() => onNavigate('productivity')}
                  className="mt-3 inline-flex items-center gap-1 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs rounded-xl font-mono transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Plan More Tasks
                </button>
              </div>
            )}

            {/* Quick Habits Tracker Grid */}
            <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5 font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                Active Habits Streak
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {habits.slice(0, 4).map(habit => {
                  const completedToday = habit.history[todayStr] === true;
                  return (
                    <div 
                      key={habit.id}
                      className={`p-3 rounded-xl flex items-center justify-between transition-all border ${
                        completedToday 
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="text-xs font-medium truncate">{habit.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500 dark:text-orange-400 fill-orange-500/10 dark:fill-orange-400/20" />
                          <span>{habit.streak} day streak</span>
                        </p>
                      </div>
                      <div className="shrink-0 font-mono text-xs text-slate-400">
                        {completedToday ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            DONE
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            PENDING
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 flex justify-end">
            <button 
              onClick={() => onNavigate('productivity')}
              className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 flex items-center gap-1 hover:translate-x-1 transition-all cursor-pointer"
            >
              Access Productivity Center <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Hydration & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-health-quick">
        
        {/* Animated Hydration Glass */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden" id="hydration-quick-widget">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-cyan-600 dark:text-cyan-400 fill-cyan-500/10 animate-pulse" />
                Hydration Monitor
              </h3>
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">{todayHealth.waterIntake} ml / {waterTarget} ml</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Click the glass to log water intake (+250ml).</p>
          </div>

          <div className="flex justify-center items-center py-4 relative">
            {/* Visual Glass */}
            <div 
              onClick={handleAddWater}
              className="w-24 h-36 border-2 border-slate-300 dark:border-slate-500/30 rounded-b-3xl rounded-t-lg relative cursor-pointer overflow-hidden transition-all duration-300 hover:border-cyan-400/50 hover:shadow-cyan-500/10 bg-slate-100 dark:bg-slate-900/40 shadow-inner"
              style={{ clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)' }}
            >
              {/* Glass liquid fill */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600/60 to-cyan-400/70 transition-all duration-500"
                style={{ height: `${waterProgress}%` }}
              >
                {/* Bubble animations */}
                <div className="absolute top-1 left-4 w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="absolute top-2 right-6 w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.8s' }} />
                <div className="absolute top-4 left-10 w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
              </div>
              
              {/* Centered label */}
              <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-slate-700 dark:text-slate-300 pointer-events-none drop-shadow">
                +250ml
              </div>
            </div>
          </div>

          <button 
            onClick={handleAddWater}
            className="w-full py-2 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl text-xs font-mono text-center transition-all mt-4 cursor-pointer"
          >
            Quick log water intake
          </button>
        </div>

        {/* Steps and Sleep stats */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between" id="steps-sleep-widget">
          <div>
            <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-4">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Daily Active Vitals
            </h3>

            {/* Steps Ring mock */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Step Count Target:</span>
                  <span className="font-mono text-emerald-650 dark:text-emerald-400 font-bold">{todayHealth.steps.toLocaleString()} / 10,000 steps</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-900/60 h-2 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (todayHealth.steps / 10000) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Sleep Duration:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{todayHealth.sleepHours} hrs / 8 hrs</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-900/60 h-2 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (todayHealth.sleepHours / 8) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Today's Energy Wave:</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">⚡ {todayEnergy} / 10</span>
                </div>
                <div className="flex gap-1 h-2" id="energy-wave-indicator-bars">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 h-full rounded-sm transition-all duration-300 ${
                        i < todayEnergy 
                          ? todayEnergy >= 8 
                            ? 'bg-emerald-500' 
                            : todayEnergy >= 5 
                            ? 'bg-amber-500' 
                            : 'bg-rose-500' 
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('vitals')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 transition-all mt-4 cursor-pointer"
          >
            Manage Health Metrics <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Financial Flow widget */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between" id="finance-flow-widget">
          <div>
            <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Financial Ledger Daily Flow
            </h3>

            <div className="grid grid-cols-2 gap-2 my-2">
              <div className="p-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-center">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">INCOME TODAY</span>
                <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">+${todayIncome}</span>
              </div>
              <div className="p-2.5 bg-rose-500/5 rounded-xl border border-rose-500/10 text-center">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">EXPENSES TODAY</span>
                <span className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">-${todayExpense}</span>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5 font-bold">RECENT FLOWS</span>
              <div className="space-y-1.5 max-h-20 overflow-y-auto pr-1">
                {financeRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="flex justify-between items-center text-xs p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900/40">
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-36">{record.description}</span>
                    <span className={`font-mono text-[10px] font-semibold ${record.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {record.type === 'income' ? '+' : '-'}${record.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('vitals')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-mono flex items-center justify-center gap-1.5 transition-all mt-4 cursor-pointer"
          >
            Review Financial Books <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
