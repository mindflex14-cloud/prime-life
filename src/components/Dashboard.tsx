import { motion } from 'motion/react';
import React, { useMemo } from 'react';
import { 
  Flame, 
  Sparkles, 
  Compass, 
  Heart, 
  ChevronRight, 
  Radio, 
  BookOpen,
  Quote,
  Shield,
  Layers,
  Brain,
  Sliders,
  CheckCircle,
  Lightbulb,
  Calendar,
  Smile,
  Meh,
  Frown
} from 'lucide-react';
import { LifeWheel, UserProfile, VisionCard, PhilosophicalEntry, BookWisdomEntry, IntuitionEntry, JournalEntry } from '../types';

interface DashboardProps {
  profile: UserProfile;
  lifeWheel: LifeWheel;
  updateLifeWheel?: (wheel: LifeWheel) => void;
  visionCards?: VisionCard[];
  philosophicalEntries?: PhilosophicalEntry[];
  bookWisdomEntries?: BookWisdomEntry[];
  intuitionEntries?: IntuitionEntry[];
  journalEntries?: Record<string, JournalEntry>;
  onNavigate: (tab: string) => void;
  // Optional legacy props
  goals?: any;
  milestones?: any;
  tasks?: any;
  habits?: any;
  healthLogs?: any;
  financeRecords?: any;
  updateHealthLog?: any;
  onStartTimer?: any;
}

export default function Dashboard({
  profile,
  lifeWheel,
  updateLifeWheel,
  visionCards = [],
  philosophicalEntries = [],
  bookWisdomEntries = [],
  intuitionEntries = [],
  journalEntries = {},
  onNavigate
}: DashboardProps) {
  const todayStr = useMemo(() => {
    const todayLocal = new Date();
    const year = todayLocal.getFullYear();
    const month = String(todayLocal.getMonth() + 1).padStart(2, '0');
    const day = String(todayLocal.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Life Wheel average balance (0 to 10)
  const lifeBalanceAverage = useMemo(() => {
    const values = Object.values(lifeWheel || {});
    if (values.length === 0) return 7.5;
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    return (sum / values.length).toFixed(1);
  }, [lifeWheel]);

  // Calculate Resonance Frequency Score (432Hz to 963Hz - Solfeggio resonance metaphor)
  const frequencyScore = useMemo(() => {
    let score = 432; // Base natural resonance

    // Contribution from Life Wheel balance (up to +250 Hz)
    const avgScore = Number(lifeBalanceAverage) || 7;
    score += (avgScore / 10) * 250;

    // Contribution from active Vision Cards (up to +100 Hz)
    const visionCount = (visionCards || []).length;
    score += Math.min(100, visionCount * 25);

    // Contribution from Growth Ledger & Philosophy (up to +180 Hz)
    const reflectionsCount = (philosophicalEntries || []).length + (bookWisdomEntries || []).length + (intuitionEntries || []).length;
    score += Math.min(180, reflectionsCount * 30);

    return Math.min(963, Math.max(432, Math.round(score)));
  }, [lifeBalanceAverage, visionCards, philosophicalEntries, bookWisdomEntries, intuitionEntries]);

  // Resonance color based on frequency
  const resonanceColor = frequencyScore > 750 ? 'text-purple-500 dark:text-purple-400' : 
                         frequencyScore > 550 ? 'text-cyan-500 dark:text-cyan-400' : 
                         'text-amber-500 dark:text-amber-400';
  const resonanceBg = frequencyScore > 750 ? 'bg-purple-500 dark:bg-purple-400' : 
                      frequencyScore > 550 ? 'bg-cyan-500 dark:bg-cyan-400' : 
                      'bg-amber-500 dark:bg-amber-400';

  // Last 7 days dates
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      return {
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: dateStr === todayStr,
        journal: journalEntries[dateStr]
      };
    });
  }, [todayStr, journalEntries]);

  // Highlighted Stoic / Philosophical reflection
  const featuredReflection = useMemo(() => {
    if (philosophicalEntries && philosophicalEntries.length > 0) {
      return philosophicalEntries[philosophicalEntries.length - 1];
    }
    return {
      title: 'The Obstacle is the Way',
      reflection: 'What stands in the way becomes the way. Every challenge is an opportunity to cultivate deeper virtue, clarity, and discipline.'
    };
  }, [philosophicalEntries]);

  // Highlighted Book Wisdom
  const featuredBook = useMemo(() => {
    if (bookWisdomEntries && bookWisdomEntries.length > 0) {
      return bookWisdomEntries[bookWisdomEntries.length - 1];
    }
    return {
      title: 'Atomic Habits',
      author: 'James Clear',
      learnings: ['You do not rise to the level of your goals. You fall to the level of your systems.']
    };
  }, [bookWisdomEntries]);

  // Life Wheel dimensions mapping
  const wheelDimensions: { key: keyof LifeWheel; label: string; icon: any; color: string }[] = [
    { key: 'personalGrowth', label: 'Personal Growth', icon: Brain, color: 'text-purple-500' },
    { key: 'spirituality', label: 'Spirituality & Mind', icon: Sparkles, color: 'text-cyan-500' },
    { key: 'relationships', label: 'Relationships', icon: Heart, color: 'text-rose-500' },
    { key: 'environment', label: 'Environment', icon: Compass, color: 'text-emerald-500' },
    { key: 'career', label: 'Vocation & Purpose', icon: Shield, color: 'text-blue-500' },
    { key: 'finance', label: 'Abundance & Freedom', icon: Layers, color: 'text-amber-500' },
    { key: 'health', label: 'Physical Vitality', icon: Flame, color: 'text-orange-500' },
    { key: 'fun', label: 'Joy & Recreation', icon: Smile, color: 'text-pink-500' },
  ];

  return (
    <div className="space-y-6" id="dashboard-main">
      {/* TESLA FREQUENCY ENGINE BANNER */}
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
          <div className="flex-1 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <Radio className="w-4 h-4 text-cyan-500" />
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-slate-700 dark:text-slate-300">Central Resonance System</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-medium text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
              "If you want to find the secrets of the universe, think in terms of <span className="text-cyan-600 dark:text-cyan-400 italic font-semibold">energy, frequency and vibration</span>."
            </h1>
            <p className="text-sm font-mono text-slate-500 dark:text-slate-400">— Nikola Tesla</p>
          </div>
          
          <div className="shrink-0 flex flex-col items-end justify-center">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 tracking-widest font-bold mb-2">Resonance State</span>
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
              <p className="text-[10px] font-mono text-slate-400 mt-1">Harmonic Alignment Index</p>
              {/* Horizontal Equalizer Bar */}
              <div className="flex gap-1.5 mt-3 w-full justify-end items-end h-8">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    className={`w-2 rounded-t-sm ${i < ((frequencyScore - 400) / 600) * 12 ? resonanceBg : 'bg-slate-200 dark:bg-slate-800'}`}
                    animate={{ height: i < ((frequencyScore - 400) / 600) * 12 ? ['40%', `${Math.random() * 60 + 40}%`, '40%'] : '20%' }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 CORE PILLARS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* COLUMN 1: UNSTOPPABLE ME & IDENTITY STANDARD */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/5 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Unstoppable Me
                </h3>
                <button 
                  onClick={() => onNavigate('newme')} 
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-500"
                  title="Open Unstoppable Me"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* User Designation & Standard */}
                <div className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-2xl text-left">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block mb-1">
                    Operating Designation
                  </span>
                  <div className="text-base font-display font-bold text-slate-800 dark:text-slate-100">
                    {profile?.name || 'Aether Standard'}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Rooted in immutable principles, personal standard, and highest internal alignment.
                  </p>
                </div>

                {/* Identity Standard Pillar */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-2xl text-left space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
                    Core Standard Pillar
                  </span>
                  <p className="text-xs font-serif italic text-slate-700 dark:text-slate-300 leading-relaxed">
                    "I am the architect of my mindset, unwavering under pressure, calm in turmoil, relentlessly dedicated to growth."
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={() => onNavigate('newme')} 
                className="w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Refine Identity Standards <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 2: VISION BOARD & LIFE BALANCE */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/5 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  Vision & Life Harmony
                </h3>
                <button 
                  onClick={() => onNavigate('vision')} 
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-500"
                  title="Open Vision Board"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Balance Index */}
                <div className="p-4 bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-100 dark:border-cyan-500/10 rounded-2xl text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold block mb-1">
                        Equilibrium Score
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-display font-bold text-cyan-600 dark:text-cyan-400">
                          {lifeBalanceAverage}
                        </span>
                        <span className="text-xs font-mono text-slate-400">/ 10</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block mb-1">
                        Vision Cards
                      </span>
                      <span className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">
                        {visionCards.length}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(Number(lifeBalanceAverage) / 10) * 100}%` }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Highlighted Dimensions Mini-Matrix */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-2xl space-y-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block text-left mb-2">
                    Key Dimension Snapshot
                  </span>
                  {wheelDimensions.slice(0, 3).map((dim) => {
                    const score = lifeWheel?.[dim.key] ?? 7;
                    return (
                      <div key={dim.key} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                          <dim.icon className={`w-3.5 h-3.5 ${dim.color}`} />
                          {dim.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cyan-500 rounded-full" 
                              style={{ width: `${(score / 10) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 w-5 text-right">
                            {score}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={() => onNavigate('vision')} 
                className="w-full py-2.5 px-4 bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Expand Vision Board & Matrix <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 3: GROWTH LEDGER & MIND MATRIX */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/5 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  Growth Ledger & Wisdom
                </h3>
                <button 
                  onClick={() => onNavigate('logs')} 
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-500"
                  title="Open Growth Ledger"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-left">
                {/* Featured Philosophical Reflection */}
                <div className="p-4 bg-purple-50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/10 rounded-2xl">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Quote className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-[10px] font-mono uppercase font-bold text-purple-600 dark:text-purple-400">
                      Philosophical Insight
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 mb-1">
                    {featuredReflection.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {featuredReflection.reflection}
                  </p>
                </div>

                {/* Featured Book Wisdom */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 rounded-2xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                      Book Learnings
                    </span>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                      {featuredBook.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {featuredBook.learnings?.[0] || 'Focus on who you wish to become through continuous micro-iterations.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={() => onNavigate('logs')} 
                className="w-full py-2.5 px-4 bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Access Growth Ledger <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* FULL-WIDTH LIFE WHEEL BALANCE MATRIX */}
      <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/5 shadow-sm mt-6 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-500" />
              Life Wheel Equilibrium Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Harmonic assessment across the 8 fundamental dimensions of intentional living.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('vision')} 
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold flex items-center gap-1.5 self-start md:self-auto"
          >
            Adjust Wheel Levels <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wheelDimensions.map((dim) => {
            const score = lifeWheel?.[dim.key] ?? 7;
            const percentage = (score / 10) * 100;
            return (
              <div 
                key={dim.key} 
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <dim.icon className={`w-4 h-4 ${dim.color}`} />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {dim.label}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    {score}/10
                  </span>
                </div>
                <div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={`h-full rounded-full ${
                        score >= 8 ? 'bg-cyan-500' : score >= 6 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5 text-[9px] font-mono text-slate-400">
                    <span>Alignment</span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-DAY REFLECTION & GROWTH TIMELINE */}
      <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/5 shadow-sm mt-6 text-left">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              Weekly Growth & Reflection Flow
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily intentionality and journal records logged over the past 7 days.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('logs')} 
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-500 text-xs flex items-center gap-1 font-mono"
          >
            Open Ledger <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {last7Days.map((day) => {
            const hasEntry = !!day.journal;
            const mood = day.journal?.mood;
            return (
              <div 
                key={day.dateStr} 
                className={`p-3.5 rounded-2xl border transition-all ${
                  day.isToday 
                    ? 'bg-purple-50/70 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 shadow-sm' 
                    : 'bg-slate-50/70 dark:bg-slate-800/20 border-slate-100 dark:border-white/5'
                } flex flex-col justify-between h-[130px]`}
              >
                <div className="text-center">
                  <span className={`text-[9px] font-mono uppercase block ${
                    day.isToday ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-400'
                  }`}>
                    {day.dayName}
                  </span>
                  <span className={`text-base font-display font-bold ${
                    day.isToday ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-200'
                  }`}>
                    {day.dayNum}
                  </span>
                </div>

                <div className="text-center py-1">
                  {hasEntry ? (
                    <div className="inline-flex flex-col items-center gap-1">
                      {mood === 'great' || mood === 'good' ? (
                        <Smile className="w-4 h-4 text-emerald-500" />
                      ) : mood === 'meh' ? (
                        <Meh className="w-4 h-4 text-amber-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-cyan-500" />
                      )}
                      <span className="text-[9px] font-mono text-slate-500 capitalize">
                        {mood || 'Logged'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[10px] font-mono text-slate-400 italic">
                      —
                    </div>
                  )}
                </div>

                <div className="text-center border-t border-slate-200/50 dark:border-white/5 pt-1.5">
                  <span className={`text-[8px] font-mono ${
                    hasEntry ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-400'
                  }`}>
                    {hasEntry ? 'Reflected' : 'Quiet Day'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
