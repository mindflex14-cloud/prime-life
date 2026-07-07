import { motion } from 'motion/react';
import React, { useMemo } from 'react';
import { 
  Activity, 
  Target, 
  Flame, 
  Droplet, 
  TrendingUp, 
  CheckCircle,
  Briefcase,
  DollarSign,
  Users,
  Sparkles,
  Smile,
  TreePine,
  Compass,
  Heart,
  ChevronRight,
  Zap,
  Calendar,
  Eye,
  Radio,
  Dumbbell,
  Check,
  Play,
  BrainCircuit,
  Rocket,
  Network
} from 'lucide-react';
import { Goal, Milestone, Task, Habit, HealthLog, LifeWheel, UserProfile, FinancialRecord } from '../types';

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
  onNavigate,
  onStartTimer
}: DashboardProps) {
  const todayStr = useMemo(() => {
    const todayLocal = new Date();
    const year = todayLocal.getFullYear();
    const month = String(todayLocal.getMonth() + 1).padStart(2, '0');
    const day = String(todayLocal.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const todayHealth = useMemo(() => {
    const health = healthLogs[todayStr] || { steps: 0, waterIntake: 0, sleepHours: 0, energyLevel: 0 };
    
    // Read from vitals recovery history as source of truth
    const raw = localStorage.getItem('lifeos_vitals_recovery_history');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const record = parsed[todayStr];
        if (record) {
          return {
            ...health,
            waterIntake: record.waterIntake ?? health.waterIntake,
            sleepHours: record.sleepDuration ?? health.sleepHours,
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return health;
  }, [healthLogs, todayStr]);

  const recoveryHistoryData = useMemo(() => {
    const raw = localStorage.getItem('lifeos_vitals_recovery_history');
    let parsed: Record<string, any> = {};
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        console.error(e);
      }
    }

    // Generate last 7 days
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      
      const record = parsed[dateStr];
      const sleepHours = record ? (record.sleepDuration ?? 0) : (healthLogs[dateStr]?.sleepHours ?? 0);
      const waterIntake = record ? (record.waterIntake ?? 0) : (healthLogs[dateStr]?.waterIntake ?? 0);
      const sleepTarget = record ? (record.sleepTarget ?? 8) : 8;
      const waterGoal = record ? (record.dailyWaterGoal ?? 3000) : 3000;

      return {
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        sleepHours,
        sleepTarget,
        waterIntake,
        waterGoal,
      };
    });
  }, [healthLogs]);
  
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const completedTodayTasks = todayTasks.filter(t => t.status === 'completed').length;
  const mit = todayTasks.filter(t => t.status !== 'completed').sort((a, b) => a.priority === 'high' ? -1 : 1)[0];

  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;

  const todayFinance = financeRecords.filter(f => f.date === todayStr);
  const todayIncome = todayFinance.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
  
  // Calculate "Frequency Score" (0-1000 Hz metaphor)
  const frequencyScore = useMemo(() => {
    let score = 432; // Base frequency (432Hz)
    
    // Productivity contribution
    if (todayTasks.length > 0) {
      score += (completedTodayTasks / todayTasks.length) * 150;
    }
    
    // Health contribution
    if (todayHealth.sleepHours >= 7) score += 50;
    if (todayHealth.waterIntake >= 2000) score += 50;
    score += (todayHealth.energyLevel || 0) * 10;
    score += Math.min(100, (todayHealth.steps / 10000) * 100);
    
    // Life balance contribution
    const lifeBalance = Object.values(lifeWheel).reduce((a, b) => a + b, 0) / 8;
    score += lifeBalance * 10;
    
    return Math.min(999, Math.round(score));
  }, [todayTasks, completedTodayTasks, todayHealth, lifeWheel]);

  // Resonance color based on frequency
  const resonanceColor = frequencyScore > 750 ? 'text-purple-500 dark:text-purple-400' : 
                         frequencyScore > 550 ? 'text-cyan-500 dark:text-cyan-400' : 
                         'text-amber-500 dark:text-amber-400';
  const resonanceBg = frequencyScore > 750 ? 'bg-purple-500 dark:bg-purple-400' : 
                      frequencyScore > 550 ? 'bg-cyan-500 dark:bg-cyan-400' : 
                      'bg-amber-500 dark:bg-amber-400';

  // Calendar mapping (last 7 days activity)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  // Neural Capacity / Deep Work Momentum (New feature replacing spider map)
  const deepWorkTotal = tasks.reduce((sum, t) => sum + (t.pomodorosCompleted || 0), 0) * 25; // in minutes
  const deepWorkHours = (deepWorkTotal / 60).toFixed(1);
  
  // Find upcoming milestone
  const upcomingMilestone = milestones.filter(m => !m.completed).sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())[0];

  return (
    <div className="space-y-6" id="dashboard-main">
      {/* TESLA FREQUENCY ENGINE BANNER - REFINED */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden bg-white dark:bg-[#0a0a0f] border border-slate-200 dark:border-white/5 shadow-sm">
        {/* Animated frequency waves background */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none overflow-hidden">
           <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
             <motion.path 
               d="M0,100 C150,200 350,0 500,100 C650,200 850,0 1000,100" 
               stroke="currentColor" strokeWidth="2" fill="none" className="text-cyan-500"
               animate={{ d: ["M0,100 C150,200 350,0 500,100 C650,200 850,0 1000,100", "M0,100 C150,0 350,200 500,100 C650,0 850,200 1000,100", "M0,100 C150,200 350,0 500,100 C650,200 850,0 1000,100"] }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             />
             <motion.path 
               d="M0,100 C200,50 300,150 500,100 C700,50 800,150 1000,100" 
               stroke="currentColor" strokeWidth="1" fill="none" className="text-purple-500"
               animate={{ d: ["M0,100 C200,50 300,150 500,100 C700,50 800,150 1000,100", "M0,100 C200,150 300,50 500,100 C700,150 800,50 1000,100", "M0,100 C200,50 300,150 500,100 C700,50 800,150 1000,100"] }}
               transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
             />
           </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <Radio className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-slate-700 dark:text-slate-300">Central Resonance</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-medium text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
              "If you want to find the secrets of the universe, think in terms of <span className="text-cyan-600 dark:text-cyan-400 italic font-semibold">energy, frequency and vibration</span>."
            </h1>
            <p className="text-sm font-mono text-slate-500 dark:text-slate-400">— Nikola Tesla</p>
          </div>
          
          <div className="shrink-0 flex flex-col items-end justify-center">
             {/* Refined Frequency Display instead of the old circle */}
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 tracking-widest font-bold mb-2">Current State</span>
                <div className="flex items-baseline gap-2">
                  <motion.span 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`text-6xl md:text-7xl font-display font-bold tracking-tighter ${resonanceColor}`}
                  >
                    {frequencyScore}
                  </motion.span>
                  <span className="text-xl font-mono text-slate-400 dark:text-slate-500 font-bold">Hz</span>
                </div>
                {/* Horizontal Equalizer Bar */}
                <div className="flex gap-1.5 mt-3 w-full justify-end items-end h-8">
                  {Array.from({length: 12}).map((_, i) => (
                    <motion.div 
                      key={i}
                      className={`w-2 rounded-t-sm ${i < (frequencyScore/1000)*12 ? resonanceBg : 'bg-slate-200 dark:bg-slate-800'}`}
                      animate={{ height: i < (frequencyScore/1000)*12 ? ['40%', `${Math.random() * 60 + 40}%`, '40%'] : '20%' }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* NEW LEFT COLUMN: NEURAL STATE & MOMENTUM (Replacing Spider Map) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/5 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-500" />
                Neural Trajectory
              </h3>
            </div>
            
            <div className="space-y-5 flex-1">
              {/* Cognitive Momentum */}
              <div className="p-4 bg-purple-50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/10 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-mono uppercase font-bold text-slate-600 dark:text-slate-300">Total Deep Work</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-display font-bold text-purple-600 dark:text-purple-400">{deepWorkHours}</span>
                  <span className="text-sm font-mono text-slate-500 dark:text-slate-400 mb-1.5">Hours</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Cumulative deep execution time tracked via Focus Executive.
                </p>
              </div>

              {/* Next Milestone */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2 font-bold">Upcoming Target</span>
                {upcomingMilestone ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-xl flex flex-col gap-1.5 border-l-2 border-l-blue-500">
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{upcomingMilestone.title}</span>
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">{new Date(upcomingMilestone.targetDate).toLocaleDateString()}</span>
                  </div>
                ) : (
                  <div className="p-3 text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800/40 rounded-xl">No upcoming milestones</div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Network className="w-3.5 h-3.5 text-emerald-500" /> Capital Flow
              </h3>
              <div className="flex gap-2">
                <div className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-lg flex items-center gap-1.5">
                  <span className="text-[9px] font-mono uppercase text-slate-500 dark:text-slate-400">Income</span>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">+${todayIncome}</span>
                </div>
                <button onClick={() => onNavigate('venture')} className="p-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-emerald-100 dark:border-emerald-500/20 rounded-lg transition-colors cursor-pointer text-emerald-600 dark:text-emerald-400" title="Open Venture Lab">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: PRODUCTIVITY & GOALS */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/5 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-500" />
                Productivity & Goals
              </h3>
              <button onClick={() => onNavigate('productivity')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-500">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Daily Task Execution</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{completedTodayTasks}/{todayTasks.length}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${todayTasks.length ? (completedTodayTasks / todayTasks.length) * 100 : 0}%` }}
                    className="h-full bg-cyan-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Macro Goals Progress</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{completedGoals}/{totalGoals}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${totalGoals ? (completedGoals / totalGoals) * 100 : 0}%` }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3 font-bold">Active MIT</span>
                {mit ? (
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-100 dark:border-cyan-500/10 rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{mit.title}</h4>
                      <p className="text-xs text-cyan-600 dark:text-cyan-500 mt-0.5 font-mono">Pomo: {mit.pomodorosCompleted}/{mit.pomodorosEstimated}</p>
                    </div>
                    <button 
                      onClick={() => onStartTimer(mit)}
                      className="w-8 h-8 flex items-center justify-center bg-cyan-500 text-white rounded-full hover:scale-105 transition-transform cursor-pointer shadow-md shadow-cyan-500/20 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>
                ) : (
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-2xl text-center">
                     <p className="text-xs text-slate-500 dark:text-slate-400">No active priority tasks.</p>
                   </div>
                )}
              </div>

              <div className="pt-2">
                 <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3 font-bold">Execution Activity</span>
                 <div className="flex gap-1.5 justify-between">
                   {last7Days.map(date => {
                     const isToday = date === todayStr;
                     const dayTasks = tasks.filter(t => t.date === date);
                     const completed = dayTasks.filter(t => t.status === 'completed').length;
                     const intensity = dayTasks.length === 0 ? 0 : completed / dayTasks.length;
                     
                     return (
                       <div key={date} className="flex flex-col items-center gap-1.5">
                         <div 
                           className={`w-6 h-6 rounded-md ${isToday ? 'ring-2 ring-cyan-500 ring-offset-1 dark:ring-offset-slate-900' : ''}`}
                           style={{ 
                             backgroundColor: intensity === 0 ? 'var(--color-bg-tertiary)' : 
                                              intensity < 0.5 ? 'rgba(6, 182, 212, 0.3)' : 
                                              intensity < 0.9 ? 'rgba(6, 182, 212, 0.6)' : 
                                              'rgba(6, 182, 212, 1)'
                           }}
                           title={`${date}: ${completed} tasks`}
                         />
                         <span className="text-[8px] font-mono text-slate-400">{new Date(date).getDate()}</span>
                       </div>
                     )
                   })}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BIOLOGICAL COMMAND & CALENDAR */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/5 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Apex Bio-Command
              </h3>
              <button onClick={() => onNavigate('vitals')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-500">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1">
              {/* Energy */}
              <div className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-2xl flex flex-col justify-center items-center text-center">
                <Zap className="w-5 h-5 text-amber-500 mb-2" />
                <span className="text-xl font-display font-bold text-amber-600 dark:text-amber-400">{todayHealth.energyLevel || 0}<span className="text-sm text-amber-500/50">/10</span></span>
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mt-1">Energy Wave</span>
              </div>
              
              {/* Sleep */}
              <div className="p-4 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-2xl flex flex-col justify-center items-center text-center">
                <Sparkles className="w-5 h-5 text-indigo-500 mb-2" />
                <span className="text-xl font-display font-bold text-indigo-600 dark:text-indigo-400">{todayHealth.sleepHours || 0}<span className="text-sm text-indigo-500/50">h</span></span>
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mt-1">Deep Sleep</span>
              </div>

              {/* Water */}
              <div className="p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-2xl flex flex-col justify-center items-center text-center">
                <Droplet className="w-5 h-5 text-blue-500 mb-2" />
                <span className="text-xl font-display font-bold text-blue-600 dark:text-blue-400">{(todayHealth.waterIntake / 1000).toFixed(1)}<span className="text-sm text-blue-500/50">L</span></span>
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mt-1">Hydration</span>
              </div>

              {/* Activity */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl flex flex-col justify-center items-center text-center">
                <Flame className="w-5 h-5 text-emerald-500 mb-2" />
                <span className="text-xl font-display font-bold text-emerald-600 dark:text-emerald-400">{(todayHealth.steps / 1000).toFixed(1)}<span className="text-sm text-emerald-500/50">k</span></span>
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 mt-1">Steps</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
               <div className="flex items-center justify-between text-xs mb-2">
                 <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Habit Streaks</span>
               </div>
               <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                 {habits.slice(0, 4).map(h => (
                   <div key={h.id} className="shrink-0 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-xl flex items-center gap-2">
                     <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 max-w-[60px] truncate">{h.title}</span>
                     <span className="text-xs font-bold text-orange-500 flex items-center"><Flame className="w-3 h-3 mr-0.5"/>{h.streak}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* BIOLOGICAL RESONANCE GRAPHICAL FLOW */}
      <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/5 shadow-sm mt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Biological Rhythm Tracking
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dual sleep duration and hydration tracking over the last 7 days.</p>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-slate-600 dark:text-slate-300">Sleep (hrs)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-600 dark:text-slate-300">Hydration (ml)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SLEEP TREND CHART */}
          <div className="p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col h-[280px]">
            <span className="text-xs font-mono uppercase text-indigo-500 dark:text-indigo-400 font-semibold mb-6 block">Sleep Duration Trend</span>
            <div className="flex-1 flex items-end justify-between gap-2 relative px-2">
              {/* Background horizontal target lines */}
              <div className="absolute left-0 right-0 border-t border-dashed border-slate-200 dark:border-slate-800" style={{ bottom: '66.6%' }}>
                <span className="absolute -top-3.5 right-0 text-[8px] font-mono text-slate-400 dark:text-slate-500">Sleep Goal (8h)</span>
              </div>
              
              {recoveryHistoryData.map((day) => {
                const maxVal = 12; // max sleep duration reference
                const heightPercent = Math.min((day.sleepHours / maxVal) * 100, 100);
                const isOverGoal = day.sleepHours >= day.sleepTarget;

                return (
                  <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-[90%] bg-slate-950 text-white text-[10px] font-mono py-1 px-2 rounded border border-slate-800 transition-opacity pointer-events-none whitespace-nowrap z-30">
                      Sleep: {day.sleepHours}h / {day.sleepTarget}h
                    </div>

                    {/* Bar */}
                    <div className="w-full relative h-[160px] flex items-end justify-center">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        className={`w-3 sm:w-5 rounded-t-md transition-all duration-300 ${
                          isOverGoal 
                            ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.25)]' 
                            : 'bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-700 dark:to-indigo-900'
                        }`}
                      />
                    </div>
                    
                    {/* Date label */}
                    <div className="text-center mt-1">
                      <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block">{day.dayName}</span>
                      <span className="text-[10px] font-display font-bold text-slate-700 dark:text-slate-300">{day.dayNum}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HYDRATION TREND CHART */}
          <div className="p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col h-[280px]">
            <span className="text-xs font-mono uppercase text-blue-500 dark:text-blue-400 font-semibold mb-6 block">Hydration Trend</span>
            <div className="flex-1 flex items-end justify-between gap-2 relative px-2">
              {/* Background horizontal target lines */}
              <div className="absolute left-0 right-0 border-t border-dashed border-slate-200 dark:border-slate-800" style={{ bottom: '75%' }}>
                <span className="absolute -top-3.5 right-0 text-[8px] font-mono text-slate-400 dark:text-slate-500 font-bold">Hydration Goal (3L)</span>
              </div>
              
              {recoveryHistoryData.map((day) => {
                const maxVal = 4000; // max hydration reference
                const heightPercent = Math.min((day.waterIntake / maxVal) * 100, 100);
                const isOverGoal = day.waterIntake >= day.waterGoal;

                return (
                  <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-[90%] bg-slate-950 text-white text-[10px] font-mono py-1 px-2 rounded border border-slate-800 transition-opacity pointer-events-none whitespace-nowrap z-30">
                      Water: {day.waterIntake}ml / {day.waterGoal}ml
                    </div>

                    {/* Bar */}
                    <div className="w-full relative h-[160px] flex items-end justify-center">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        className={`w-3 sm:w-5 rounded-t-md transition-all duration-300 ${
                          isOverGoal 
                            ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)]' 
                            : 'bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-700 dark:to-blue-900'
                        }`}
                      />
                    </div>
                    
                    {/* Date label */}
                    <div className="text-center mt-1">
                      <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block">{day.dayName}</span>
                      <span className="text-[10px] font-display font-bold text-slate-700 dark:text-slate-300">{day.dayNum}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FULL WIDTH BOTTOM SECTION: CALENDAR & ACTIVITY TIMELINE */}
      <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/5 shadow-sm mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            Weekly Execution & Activity Calendar
          </h3>
          <button onClick={() => onNavigate('calendar')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-500 text-xs flex items-center gap-1 font-mono">
            View Full <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({length: 7}).map((_, i) => {
            const d = new Date();
            // Start from 6 days ago up to today
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            
            const dayTasks = tasks.filter(t => t.date === dateStr);
            const dayCompleted = dayTasks.filter(t => t.status === 'completed');
            const dayHealth = healthLogs[dateStr];
            
            return (
              <div key={dateStr} className={`p-3 rounded-2xl border ${isToday ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' : 'bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-white/5'} flex flex-col h-full`}>
                <div className="text-center mb-3">
                  <span className={`text-[9px] font-mono uppercase block ${isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>{dayName}</span>
                  <span className={`text-lg font-display font-bold ${isToday ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>{d.getDate()}</span>
                </div>
                
                <div className="flex-1 space-y-2">
                  {/* Tasks Summary */}
                  {dayTasks.length > 0 ? (
                    <div className="text-[10px] p-1.5 bg-white dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-white/5 flex items-center justify-between">
                       <span className="text-slate-600 dark:text-slate-300 font-medium">Tasks</span>
                       <span className={`font-mono ${dayCompleted.length === dayTasks.length ? 'text-emerald-500' : 'text-cyan-600 dark:text-cyan-400'}`}>
                         {dayCompleted.length}/{dayTasks.length}
                       </span>
                    </div>
                  ) : (
                    <div className="text-[10px] p-1.5 text-slate-400 dark:text-slate-600 text-center italic">No tasks</div>
                  )}

                  {/* Physical Activity Summary */}
                  {dayHealth && dayHealth.steps > 0 && (
                    <div className="text-[10px] p-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-lg flex items-center justify-between">
                       <Dumbbell className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                       <span className="font-mono text-emerald-700 dark:text-emerald-400">{(dayHealth.steps/1000).toFixed(1)}k</span>
                    </div>
                  )}
                  {dayHealth && dayHealth.workoutCompleted && (
                    <div className="text-[10px] p-1.5 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-lg flex items-center justify-between">
                       <span className="text-orange-700 dark:text-orange-400 truncate max-w-[50px]">{dayHealth.workoutType || 'Workout'}</span>
                       <Check className="w-3 h-3 text-orange-500" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
