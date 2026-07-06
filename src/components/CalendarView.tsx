import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Target, Flame, Lightbulb, BookOpen, ShieldAlert, Dumbbell, Activity, Edit2, Check } from 'lucide-react';
import { Task, Goal, Habit, PhilosophicalEntry, BookWisdomEntry, IntuitionEntry, HealthLog } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  philosophicalEntries?: PhilosophicalEntry[];
  bookWisdomEntries?: BookWisdomEntry[];
  intuitionEntries?: IntuitionEntry[];
  healthLogs?: Record<string, HealthLog>;
  updateHealthLog?: (date: string, log: Partial<HealthLog>) => void;
}

export default function CalendarView({ 
  tasks, 
  goals, 
  habits, 
  philosophicalEntries = [], 
  bookWisdomEntries = [], 
  intuitionEntries = [],
  healthLogs = {},
  updateHealthLog
}: CalendarViewProps) {
  const [isEditingActivity, setIsEditingActivity] = useState(false);
  const [editWorkoutType, setEditWorkoutType] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 2)); // July 2, 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-07-02');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const getDaysInMonth = (y: number, m: number) => {
    const date = new Date(y, m, 1);
    const days = [];
    
    // Fill previous month padding days
    const startDayOfWeek = date.getDay(); // 0 is Sunday
    const prevMonthLastDay = new Date(y, m, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        dayNum: prevMonthLastDay - i,
        isCurrentMonth: false,
        dateStr: new Date(y, m - 1, prevMonthLastDay - i).toISOString().split('T')[0]
      });
    }

    // Current month days
    const daysCount = new Date(y, m + 1, 0).getDate();
    for (let i = 1; i <= daysCount; i++) {
      // Correct for timezone offset issues
      const monthStr = (m + 1).toString().padStart(2, '0');
      const dayStr = i.toString().padStart(2, '0');
      days.push({
        dayNum: i,
        isCurrentMonth: true,
        dateStr: `${y}-${monthStr}-${dayStr}`
      });
    }

    // Next month padding days
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const monthStr = (m + 2).toString().padStart(2, '0');
      const dayStr = i.toString().padStart(2, '0');
      days.push({
        dayNum: i,
        isCurrentMonth: false,
        dateStr: `${y}-${monthStr}-${dayStr}`
      });
    }

    return days;
  };

  const days = getDaysInMonth(year, month);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Agenda list for selected date
  const selectedDateTasks = tasks.filter(t => t.date === selectedDateStr);
  const selectedDateGoals = goals.filter(g => g.targetDate === selectedDateStr);
  
  // Checking completed habits on that day
  const selectedDateHabits = habits.filter(h => h.history[selectedDateStr] === true);

  // Growth ledger links
  const selectedDatePhilosophical = philosophicalEntries.filter(p => p.linkedDate === selectedDateStr);
  const selectedDateBookWisdom = bookWisdomEntries.filter(b => b.linkedDate === selectedDateStr);
  const selectedDateIntuition = intuitionEntries.filter(i => i.linkedDate === selectedDateStr);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="calendar-workspace-panel">
      
      {/* Dynamic Grid Calendar */}
      <div className="lg:col-span-2 glass-panel p-5 rounded-2xl flex flex-col justify-between" id="calendar-grid-card">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-sm font-display font-semibold text-slate-800 dark:text-slate-200">
                {monthNames[month]} {year}
              </h3>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button 
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 border-b border-slate-200 dark:border-slate-800/60 pb-1.5">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar blocks */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const isSelected = day.dateStr === selectedDateStr;
              const dayTasks = tasks.filter(t => t.date === day.dateStr);
              const dayGoals = goals.filter(g => g.targetDate === day.dateStr);
              const dayHabits = habits.filter(h => h.history[day.dateStr] === true);
              const dayPhil = philosophicalEntries.filter(p => p.linkedDate === day.dateStr);
              const dayBook = bookWisdomEntries.filter(b => b.linkedDate === day.dateStr);
              const dayIntuition = intuitionEntries.filter(i => i.linkedDate === day.dateStr);

              return (
                <div 
                  key={idx}
                  onClick={() => day.isCurrentMonth && setSelectedDateStr(day.dateStr)}
                  className={`min-h-[75px] p-2.5 border rounded-xl transition-all text-left flex flex-col justify-between cursor-pointer ${
                    day.isCurrentMonth 
                      ? isSelected 
                        ? 'bg-cyan-500/15 border-cyan-500 dark:border-cyan-400 text-slate-900 dark:text-white shadow-lg ring-2 ring-cyan-500/50 dark:ring-cyan-400/60 shadow-cyan-500/10'
                        : 'bg-white dark:bg-slate-900/25 border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-slate-350 dark:hover:border-slate-750 shadow-sm hover:shadow'
                      : 'bg-slate-100/50 dark:bg-slate-950/10 border-slate-100/40 dark:border-slate-900/40 text-slate-400 dark:text-slate-600 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                    {day.dayNum}
                  </span>

                  {/* Tiny indicators */}
                  <div className="flex flex-col gap-0.5 mt-1">
                    {dayTasks.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                        <span className="text-[8px] font-mono text-slate-500 dark:text-slate-400 truncate hidden md:inline">
                          {dayTasks.length} act
                        </span>
                      </div>
                    )}
                    {dayGoals.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-[8px] font-mono text-slate-500 dark:text-slate-400 truncate hidden md:inline">
                          Goal
                        </span>
                      </div>
                    )}
                    {dayHabits.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-[8px] font-mono text-slate-500 dark:text-slate-400 truncate hidden md:inline">
                          Habit
                        </span>
                      </div>
                    )}
                    {(dayPhil.length > 0 || dayBook.length > 0 || dayIntuition.length > 0) && (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 animate-pulse" />
                        <span className="text-[8px] font-mono text-purple-600 dark:text-purple-400 truncate font-bold hidden md:inline">
                          LEDGER
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap gap-x-4 gap-y-2 justify-between items-center text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Actions</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Goal blueprint</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Habit Check</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Growth Ledger</div>
        </div>
      </div>

      {/* Right Column: Day details agenda */}
      <div className="glass-panel p-6 rounded-2xl text-left flex flex-col justify-between" id="calendar-agenda-card">
        <div>
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/60 pb-3 mb-4">
            <h4 className="text-sm font-display font-semibold text-slate-800 dark:text-slate-200">Scheduled Agenda</h4>
            <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">{selectedDateStr}</span>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {/* Goals due */}
            {selectedDateGoals.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                  <Target className="w-3 h-3" /> GOAL DEADLINES
                </span>
                {selectedDateGoals.map(g => (
                  <div key={g.id} className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-xs text-emerald-700 dark:text-emerald-300">
                    {g.title}
                  </div>
                ))}
              </div>
            )}

            
            {/* Physical Activity Tracker */}
            <div className="space-y-1.5 mt-4">
              <span className="text-[9px] font-mono uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <Dumbbell className="w-3 h-3" /> PHYSICAL ACTIVITY & WORKOUT
              </span>
              
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/50 rounded-xl space-y-2">
                {isEditingActivity ? (
                  <div className="flex flex-col gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. 5K Run, Weightlifting, Yoga" 
                      value={editWorkoutType}
                      onChange={(e) => setEditWorkoutType(e.target.value)}
                      className="text-xs p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (updateHealthLog) {
                            updateHealthLog(selectedDateStr, { 
                              workoutCompleted: true, 
                              workoutType: editWorkoutType 
                            });
                          }
                          setIsEditingActivity(false);
                        }}
                        className="flex-1 bg-emerald-500 text-white py-1 rounded text-xs font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                      <button 
                        onClick={() => setIsEditingActivity(false)}
                        className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-1 rounded text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                        {healthLogs[selectedDateStr]?.workoutCompleted 
                          ? (healthLogs[selectedDateStr]?.workoutType || 'Workout Completed')
                          : 'No workout logged'}
                      </span>
                      {healthLogs[selectedDateStr]?.steps > 0 && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {(healthLogs[selectedDateStr]?.steps / 1000).toFixed(1)}k steps
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setEditWorkoutType(healthLogs[selectedDateStr]?.workoutType || '');
                        setIsEditingActivity(true);
                      }}
                      className="p-1.5 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>


              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/10 border border-indigo-200 dark:border-indigo-900/50 rounded-xl space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-medium text-xs">
                     <Activity className="w-3.5 h-3.5" /> Sleep & Recovery
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  <div className="flex-1">
                    <label className="text-[9px] uppercase tracking-wider text-slate-500 block mb-1 font-mono">Sleep (hrs)</label>
                    <input 
                      type="number" 
                      min="0"
                      max="24"
                      value={healthLogs[selectedDateStr]?.sleepHours || 0}
                      onChange={(e) => updateHealthLog?.(selectedDateStr, { sleepHours: Number(e.target.value) })}
                      className="w-full p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] uppercase tracking-wider text-slate-500 block mb-1 font-mono">Water (ml)</label>
                    <input 
                      type="number" 
                      step="100"
                      min="0"
                      value={healthLogs[selectedDateStr]?.waterIntake || 0}
                      onChange={(e) => updateHealthLog?.(selectedDateStr, { waterIntake: Number(e.target.value) })}
                      className="w-full p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

            {/* Actions list */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono uppercase text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-bold">
                <Clock className="w-3 h-3" /> ACTION ITEMS
              </span>
              {selectedDateTasks.map(t => (
                <div 
                  key={t.id} 
                  className={`p-2.5 rounded-lg text-xs border flex items-center justify-between ${
                    t.status === 'completed' 
                      ? 'bg-slate-100/40 dark:bg-slate-950/20 border-slate-200 dark:border-slate-900 text-slate-400 dark:text-slate-500 line-through' 
                      : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 font-medium'
                  }`}
                >
                  <span>{t.title}</span>
                  <span className={`text-[8px] font-mono px-1.5 rounded shrink-0 ${
                    t.status === 'completed' ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold'
                  }`}>
                    {t.status.toUpperCase()}
                  </span>
                </div>
              ))}
              {selectedDateTasks.length === 0 && (
                <p className="text-slate-500 text-xs py-1">No action items scheduled.</p>
              )}
            </div>

            {/* Habits checked */}
            {selectedDateHabits.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold">
                  <Flame className="w-3 h-3" /> ROUTINES REINFORCED
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDateHabits.map(h => (
                    <span key={h.id} className="text-[9px] font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                      ✓ {h.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Growth Ledger integrations */}
            {(selectedDatePhilosophical.length > 0 || selectedDateBookWisdom.length > 0 || selectedDateIntuition.length > 0) && (
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800/60">
                <span className="text-[10px] font-mono uppercase text-purple-600 dark:text-purple-400 font-bold block">
                  GROWTH LEDGER CONNECTIONS
                </span>
                
                {/* Philosophical Reflections */}
                {selectedDatePhilosophical.map(p => (
                  <div key={p.id} className="p-3 bg-purple-500/5 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-900/50 rounded-xl space-y-1.5 text-left">
                    <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-medium text-xs">
                      <Lightbulb className="w-3.5 h-3.5 animate-pulse text-purple-500" />
                      <span className="font-semibold">{p.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic leading-relaxed bg-slate-50 dark:bg-slate-900/30 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800/60">
                      "{p.reflection}"
                    </p>
                  </div>
                ))}

                {/* Book Wisdom */}
                {selectedDateBookWisdom.map(b => (
                  <div key={b.id} className="p-3 bg-pink-500/5 dark:bg-pink-950/10 border border-pink-200 dark:border-pink-900/50 rounded-xl space-y-1.5 text-left font-sans">
                    <div className="flex items-center gap-1.5 text-pink-700 dark:text-pink-300 font-medium text-xs">
                      <BookOpen className="w-3.5 h-3.5 text-pink-500" />
                      <span className="font-semibold">{b.title} <span className="text-[10px] text-slate-500">by {b.author}</span></span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                      <strong className="text-[9px] uppercase block tracking-wider text-slate-400 dark:text-slate-500 mt-1 mb-0.5 font-mono">Summary</strong>
                      {b.summary}
                    </p>
                    {b.learnings.length > 0 && (
                      <div className="space-y-0.5 mt-1">
                        <strong className="text-[9px] uppercase block tracking-wider text-slate-400 dark:text-slate-500 font-mono">Core Learnings</strong>
                        {b.learnings.map((l, i) => (
                          <div key={i} className="text-[10px] text-slate-600 dark:text-slate-400 flex items-start gap-1">
                            <span className="text-pink-500">•</span> <span>{l}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Intuition training */}
                {selectedDateIntuition.map(i => (
                  <div key={i.id} className="p-3 bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-200 dark:border-indigo-900/50 rounded-xl space-y-1.5 text-left font-sans">
                    <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-medium text-xs">
                      <ShieldAlert className="w-3.5 h-3.5 text-indigo-500 animate-bounce" />
                      <span className="font-semibold">Gut Decision: {i.decision}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      <strong className="text-[9px] uppercase block tracking-wider text-slate-400 dark:text-slate-500 font-mono">Original Reasoning</strong>
                      {i.reasoning}
                    </p>
                    {i.outcome && (
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-300 italic bg-indigo-500/10 dark:bg-indigo-950/30 p-2 rounded-lg border border-indigo-500/20">
                        <strong className="text-[9px] uppercase block tracking-wider text-indigo-500 dark:text-indigo-400 font-bold font-mono">Outcome loop</strong>
                        {i.outcome}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
