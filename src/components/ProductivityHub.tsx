import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Flame, 
  ListTodo, 
  Clock, 
  Plus, 
  Trash2, 
  Sparkles, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Target, 
  Volume2, 
  VolumeX, 
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Edit3,
  Save,
  X,
  Settings,
  TrendingUp,
  Award,
  Repeat
} from 'lucide-react';
import { Task, Habit, Goal } from '../types';
import FocusExecutiveTimer from './FocusExecutiveTimer';
import ExecutionCore from './ExecutionCore';
import AIPredictions from './AIPredictions';
import { BrainCircuit } from 'lucide-react';

export interface RecurrenceConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  weeklyDays?: string[]; // e.g. ['mon', 'wed', 'fri']
  monthlyType?: 'specific_date' | 'relative_day';
  monthlySpecificDate?: number; // e.g. 1
  monthlyRelativeWeek?: number; // e.g. 1, 2, 3, 4, -1
  monthlyRelativeDay?: string; // e.g. 'mon', 'tue', ...
  endCondition: 'forever' | 'until_date';
  untilDate?: string; // YYYY-MM-DD
}

interface ProductivityHubProps {
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  addTask: (task: Omit<Task, 'id' | 'pomodorosCompleted'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addHabit: (title: string) => void;
  toggleHabitCompleted: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;
  activeTimerTaskId: string | null;
  setActiveTimerTaskId: (id: string | null) => void;
}

export default function ProductivityHub({
  tasks,
  habits,
  goals,
  addTask,
  updateTask,
  deleteTask,
  addHabit,
  toggleHabitCompleted,
  deleteHabit,
  activeTimerTaskId,
  setActiveTimerTaskId
}: ProductivityHubProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Section Toggle (Focus Mode vs Power System)
  const [activeSubTab, setActiveSubTab] = useState<'focus' | 'power' | 'ai_assistant'>('power');

  // --- STATE FOR DAILY POWER SYSTEM ---
  const [powerSystem, setPowerSystem] = useState<{
    bannerText: string;
    weeklyGoalText: string;
    days: Array<{
      id: string;
      dayName: string;
      colorClass: string;
      categories: Array<{
        id: string;
        name: string;
        isOpen?: boolean;
        tasks: Array<{
          id: string;
          title: string;
          completed: boolean;
          time?: string;
          goalTitle?: string;
          recurrence?: RecurrenceConfig;
        }>;
      }>;
    }>;
    dateTasks?: Record<string, Array<{
      id: string;
      name: string;
      isOpen?: boolean;
      tasks: Array<{
        id: string;
        title: string;
        completed: boolean;
        time?: string;
        goalTitle?: string;
        recurrence?: RecurrenceConfig;
      }>;
    }>>;
  }>(() => {
    const saved = localStorage.getItem('lifeos_power_system');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      bannerText: "FOR THE FIRST TIME IN YOUR LIFE, USE POWER.",
      weeklyGoalText: "Goal: achieve more than 50% every week.",
      days: [
        {
          id: "mon",
          dayName: "Monday",
          colorClass: "bg-amber-400 text-slate-950",
          categories: [
            {
              id: "mon-c1",
              name: "BECOME INCREDIBLY RICH",
              isOpen: true,
              tasks: [
                { id: "mon-t1", title: "Read finance reports & analyze assets", completed: false },
                { id: "mon-t2", title: "Identify new high-leverage opportunities", completed: false }
              ]
            },
            {
              id: "mon-c2",
              name: "BECOME INCREDIBLY MUSCULAR",
              isOpen: false,
              tasks: [
                { id: "mon-t3", title: "High-intensity progressive overload workout", completed: false },
                { id: "mon-t4", title: "Lock in clean 150g protein consumption", completed: false }
              ]
            },
            {
              id: "mon-c3",
              name: "CRACK EXAMS",
              isOpen: true,
              tasks: [
                { id: "mon-t5", title: "Review mock examination errors & key concepts", completed: false }
              ]
            }
          ]
        },
        {
          id: "tue",
          dayName: "Tuesday",
          colorClass: "bg-emerald-400 text-slate-950",
          categories: [
            {
              id: "tue-c1",
              name: "BECOME INCREDIBLY RICH",
              isOpen: true,
              tasks: [
                { id: "tue-t1", title: "Studied for exam", completed: true },
                { id: "tue-t2", title: "Practiced the skill", completed: false },
                { id: "tue-t3", title: "Learned about investment", completed: false }
              ]
            },
            {
              id: "tue-c2",
              name: "BECOME INCREDIBLY MUSCULAR",
              isOpen: false,
              tasks: [
                { id: "tue-t4", title: "Core & flexibility visual tracking routine", completed: false }
              ]
            },
            {
              id: "tue-c3",
              name: "BECOME INCREDIBLY INTELLIGENT",
              isOpen: false,
              tasks: [
                { id: "tue-t5", title: "Read 20 pages of high-level intelligence papers", completed: false }
              ]
            }
          ]
        },
        {
          id: "wed",
          dayName: "Wednesday",
          colorClass: "bg-orange-400 text-slate-950",
          categories: [
            {
              id: "wed-c1",
              name: "BECOME INCREDIBLY RICH",
              isOpen: true,
              tasks: [
                { id: "wed-t1", title: "Review trade logs and secure equity details", completed: false }
              ]
            },
            {
              id: "wed-c2",
              name: "BECOME INCREDIBLY MUSCULAR",
              isOpen: false,
              tasks: [
                { id: "wed-t2", title: "Heavy compound lifts & nutrition lock", completed: false }
              ]
            },
            {
              id: "wed-c3",
              name: "BECOME INCREDIBLY INTELLIGENT",
              isOpen: false,
              tasks: [
                { id: "wed-t3", title: "Design strategic business algorithm modules", completed: false }
              ]
            }
          ]
        },
        {
          id: "thu",
          dayName: "Thursday",
          colorClass: "bg-rose-400 text-slate-950",
          categories: [
            {
              id: "thu-c1",
              name: "BECOME INCREDIBLY RICH",
              isOpen: true,
              tasks: [
                { id: "thu-t1", title: "Optimize cost structure of services", completed: false }
              ]
            },
            {
              id: "thu-c2",
              name: "BECOME INCREDIBLY MUSCULAR",
              isOpen: false,
              tasks: [
                { id: "thu-t2", title: "Active recovery cardio & clean fuel hydration", completed: false }
              ]
            },
            {
              id: "thu-c3",
              name: "BECOME INCREDIBLY INTELLIGENT",
              isOpen: false,
              tasks: [
                { id: "thu-t3", title: "Write precise system command briefs", completed: false }
              ]
            }
          ]
        },
        {
          id: "fri",
          dayName: "Friday",
          colorClass: "bg-blue-400 text-slate-950",
          categories: [
            {
              id: "fri-c1",
              name: "BECOME INCREDIBLY RICH",
              isOpen: true,
              tasks: [
                { id: "fri-t1", title: "Conduct full financial health balance check", completed: false }
              ]
            },
            {
              id: "fri-c2",
              name: "BECOME INCREDIBLY MUSCULAR",
              isOpen: false,
              tasks: [
                { id: "fri-t2", title: "Full body progressive load hypertrophy focus", completed: false }
              ]
            },
            {
              id: "fri-c3",
              name: "BECOME INCREDIBLY INTELLIGENT",
              isOpen: false,
              tasks: [
                { id: "fri-t3", title: "Solve 5 complex algorithmic/game theory problems", completed: false }
              ]
            }
          ]
        },
        {
          id: "sat",
          dayName: "Saturday",
          colorClass: "bg-[#8b5a2b] text-white",
          categories: [
            {
              id: "sat-c1",
              name: "BECOME INCREDIBLY RICH",
              isOpen: true,
              tasks: [
                { id: "sat-t1", title: "Audit weekly compounding & review expansion plans", completed: false }
              ]
            },
            {
              id: "sat-c2",
              name: "BECOME INCREDIBLY MUSCULAR",
              isOpen: false,
              tasks: [
                { id: "sat-t2", title: "Track physical KPIs & meal prep alignment", completed: false }
              ]
            },
            {
              id: "sat-c3",
              name: "BECOME INCREDIBLY INTELLIGENT",
              isOpen: false,
              tasks: [
                { id: "sat-t3", title: "Conduct full weekly system review & plan", completed: false }
              ]
            }
          ]
        }
      ]
    };
  });

  // Sync states to local storage
  useEffect(() => {
    localStorage.setItem('lifeos_power_system', JSON.stringify(powerSystem));
  }, [powerSystem]);

  // --- Task Form & Filters ---
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskGoalId, setTaskGoalId] = useState('');
  const [taskEstPomos, setTaskEstPomos] = useState(2);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle,
      priority: taskPriority,
      goalId: taskGoalId || undefined,
      date: todayStr,
      status: 'todo',
      pomodorosEstimated: taskEstPomos
    });
    setTaskTitle('');
    setTaskGoalId('');
  };

  // --- Habit Form ---
  const [habitTitle, setHabitTitle] = useState('');
  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    addHabit(habitTitle);
    setHabitTitle('');
  };

  // --- Power System UI States ---
  const [powerTaskTitle, setPowerTaskTitle] = useState('');
  const [powerTaskGoalId, setPowerTaskGoalId] = useState('');
  const [powerTaskCategory, setPowerTaskCategory] = useState('WEALTH CREATION');
  const [powerCustomCategory, setPowerCustomCategory] = useState('');
  const [powerTaskTime, setPowerTaskTime] = useState('');
  const [eveningNotes, setEveningNotes] = useState('');
  const [showFullWeekTemplate, setShowFullWeekTemplate] = useState(false);
  const [powerPlanView, setPowerPlanView] = useState<'today' | 'tomorrow' | 'full'>('today');
  const [powerDate, setPowerDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  // --- RECURRENCE CONFIGURATION STATES ---
  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);
  const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceConfig | null>(null);

  // Modal temporary configuration states
  const [modalFreqType, setModalFreqType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [modalWeeklyDays, setModalWeeklyDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [modalMonthlyType, setModalMonthlyType] = useState<'specific_date' | 'relative_day'>('specific_date');
  const [modalMonthlySpecificDate, setModalMonthlySpecificDate] = useState<number>(1);
  const [modalMonthlyRelativeWeek, setModalMonthlyRelativeWeek] = useState<number>(1);
  const [modalMonthlyRelativeDay, setModalMonthlyRelativeDay] = useState<string>('mon');
  const [modalEndCondition, setModalEndCondition] = useState<'forever' | 'until_date'>('forever');
  const [modalUntilDate, setModalUntilDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // --- iOS Performance Calendar States ---
  const [perfCalendarDate, setPerfCalendarDate] = useState<Date>(() => new Date());

  // --- iOS Performance Calendar Helpers ---
  const getWeekdayIdFromDate = (dateStr: string): string => {
    if (!dateStr) return 'mon';
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return 'mon';
    // Create local date to avoid timezone offsets
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayNamesShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return dayNamesShort[d.getDay()] || 'mon';
  };

  const getCategoriesForDate = (dateStr: string) => {
    if (powerSystem.dateTasks && powerSystem.dateTasks[dateStr]) {
      return powerSystem.dateTasks[dateStr];
    }
    return [];
  };

  const setCategoriesForDate = (dateStr: string, categories: any[]) => {
    setPowerSystem(prev => {
      const updatedDateTasks = {
        ...(prev.dateTasks || {}),
        [dateStr]: categories
      };
      return {
        ...prev,
        dateTasks: updatedDateTasks
      };
    });
  };

  const importBlueprintToDate = (dateStr: string) => {
    const dayId = getWeekdayIdFromDate(dateStr);
    const dayObj = powerSystem.days.find(d => d.id === dayId);
    if (!dayObj) return;

    const importedCategories = dayObj.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      isOpen: cat.isOpen ?? true,
      tasks: cat.tasks.map(t => ({
        id: t.id + '-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        title: t.title,
        completed: false,
        time: (t as any).time || "",
        goalTitle: (t as any).goalTitle
      }))
    }));

    setCategoriesForDate(dateStr, importedCategories);
  };

  // Pre-populate today's and tomorrow's date-specific tasks if they don't exist yet
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Calculate tomorrow's date string
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

    setPowerSystem(prev => {
      const dateTasks = prev.dateTasks || {};
      let updated = false;
      const newDateTasks = { ...dateTasks };

      // Initialize Today's Date
      if (!newDateTasks[todayStr]) {
        const todayDayId = getWeekdayIdFromDate(todayStr);
        const todayDayObj = prev.days.find(d => d.id === todayDayId);
        if (todayDayObj && todayDayId !== 'sun') {
          newDateTasks[todayStr] = todayDayObj.categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            isOpen: cat.isOpen ?? true,
            tasks: cat.tasks.map(t => ({
              id: t.id,
              title: t.title,
              completed: t.completed,
              time: (t as any).time || "",
              goalTitle: (t as any).goalTitle
            }))
          }));
          updated = true;
        }
      }

      // Initialize Tomorrow's Date
      if (!newDateTasks[tomorrowStr]) {
        const tomorrowDayId = getWeekdayIdFromDate(tomorrowStr);
        const tomorrowDayObj = prev.days.find(d => d.id === tomorrowDayId);
        if (tomorrowDayObj && tomorrowDayId !== 'sun') {
          newDateTasks[tomorrowStr] = tomorrowDayObj.categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            isOpen: cat.isOpen ?? true,
            tasks: cat.tasks.map(t => ({
              id: t.id,
              title: t.title,
              completed: t.completed,
              time: (t as any).time || "",
              goalTitle: (t as any).goalTitle
            }))
          }));
          updated = true;
        }
      }

      if (updated) {
        return {
          ...prev,
          dateTasks: newDateTasks
        };
      }
      return prev;
    });
  }, [powerSystem.days]);



  // Past 7 Days list for Habit Grid
  const getPastDays = () => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      list.push({
        dateStr: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dayNum: d.getDate()
      });
    }
    return list;
  };
  const pastDays = getPastDays();

  // --- Pomodoro State ---
  const [timerMode, setTimerMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [customDuration, setCustomDuration] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isFocusOverlayActive, setIsFocusOverlayActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Breathing guide state
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingTimer, setBreathingTimer] = useState(4);

  // Audio mock trigger
  const playAlarmSound = () => {
    if (!isSoundOn) return;
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, context.currentTime); // High-pitch notification beep
      gain.gain.setValueAtTime(0.15, context.currentTime);
      osc.start();
      osc.stop(context.currentTime + 0.3);
    } catch (e) {
      console.log('Audio Context suppressed or unavailable');
    }
  };

  // Set preset times
  const resetTimerMode = (mode: 'focus' | 'short' | 'long', overrideMinutes?: number) => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    const minutes = overrideMinutes !== undefined ? overrideMinutes : (mode === 'focus' ? customMinutes : (mode === 'short' ? 5 : 15));
    const duration = minutes * 60;
    setSecondsLeft(duration);
    setCustomDuration(duration);
  };

  // Timer runner
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Timer expired
            setIsTimerRunning(false);
            playAlarmSound();
            
            if (timerMode === 'focus') {
              // Increment Pomodoro for active task
              if (activeTimerTaskId) {
                const activeTask = tasks.find(t => t.id === activeTimerTaskId);
                if (activeTask) {
                  const updatedPomos = activeTask.pomodorosCompleted + 1;
                  updateTask(activeTimerTaskId, {
                    pomodorosCompleted: updatedPomos,
                    status: updatedPomos >= activeTask.pomodorosEstimated ? 'completed' : 'in_progress'
                  });
                }
              }
              resetTimerMode('short');
            } else {
              resetTimerMode('focus');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerMode, activeTimerTaskId, tasks]);

  // Handle active task change from prop (eg if dashboard play clicked)
  useEffect(() => {
    if (activeTimerTaskId) {
      setActiveSubTab('focus');
      resetTimerMode('focus');
      setIsTimerRunning(true);
    }
  }, [activeTimerTaskId]);

  // Breathing guide looping
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathingTimer((prev) => {
        if (prev <= 1) {
          if (breathingPhase === 'inhale') {
            setBreathingPhase('hold');
            return 4;
          } else if (breathingPhase === 'hold') {
            setBreathingPhase('exhale');
            return 4;
          } else {
            setBreathingPhase('inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingPhase]);

  // --- POWER SYSTEM & PERFORMANCE LOG HELPERS ---

  // RECURRENCE DATE COMPUTATION HELPERS
  const getRelativeNthDay = (year: number, month: number, nth: number, dayOfWeek: number): string => {
    if (nth === -1) {
      // Last dayOfWeek of the month
      const lastDay = new Date(year, month + 1, 0);
      while (lastDay.getDay() !== dayOfWeek) {
        lastDay.setDate(lastDay.getDate() - 1);
      }
      return lastDay.toISOString().split('T')[0];
    } else {
      // Nth dayOfWeek of the month (e.g., 2nd Monday)
      const firstDay = new Date(year, month, 1);
      while (firstDay.getDay() !== dayOfWeek) {
        firstDay.setDate(firstDay.getDate() + 1);
      }
      firstDay.setDate(firstDay.getDate() + (nth - 1) * 7);
      return firstDay.toISOString().split('T')[0];
    }
  };

  const getNextOccurrenceDate = (fromDateStr: string, config: RecurrenceConfig): string => {
    const [y, m, d] = fromDateStr.split('-').map(Number);
    const current = new Date(y, m - 1, d);
    
    if (config.frequency === 'daily') {
      const next = new Date(current);
      next.setDate(next.getDate() + 1);
      return next.toISOString().split('T')[0];
    }
    
    if (config.frequency === 'weekly') {
      const weekdays = config.weeklyDays || [];
      if (weekdays.length === 0) {
        const next = new Date(current);
        next.setDate(next.getDate() + 1);
        return next.toISOString().split('T')[0];
      }
      
      const dayIndices = weekdays.map(dayStr => daysOfWeek.indexOf(dayStr.toLowerCase())).filter(idx => idx !== -1);
      dayIndices.sort((a, b) => a - b);
      
      const currentDayIdx = current.getDay();
      let nextDayIdx = dayIndices.find(idx => idx > currentDayIdx);
      let daysToAdd = 0;
      
      if (nextDayIdx !== undefined) {
        daysToAdd = nextDayIdx - currentDayIdx;
      } else {
        nextDayIdx = dayIndices[0];
        daysToAdd = (7 - currentDayIdx) + nextDayIdx;
      }
      
      const next = new Date(current);
      next.setDate(next.getDate() + daysToAdd);
      return next.toISOString().split('T')[0];
    }
    
    if (config.frequency === 'monthly') {
      if (config.monthlyType === 'specific_date') {
        const targetDay = config.monthlySpecificDate || 1;
        let nextYear = current.getFullYear();
        let nextMonth = current.getMonth() + 1;
        if (nextMonth > 11) {
          nextMonth = 0;
          nextYear += 1;
        }
        
        const lastDayOfNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
        const actualDay = Math.min(targetDay, lastDayOfNextMonth);
        const next = new Date(nextYear, nextMonth, actualDay);
        return next.toISOString().split('T')[0];
      } else {
        let nextYear = current.getFullYear();
        let nextMonth = current.getMonth() + 1;
        if (nextMonth > 11) {
          nextMonth = 0;
          nextYear += 1;
        }
        
        const relativeWeek = config.monthlyRelativeWeek || 1;
        const relativeDayStr = config.monthlyRelativeDay || 'mon';
        const targetDayIdx = daysOfWeek.indexOf(relativeDayStr.toLowerCase()) !== -1 
          ? daysOfWeek.indexOf(relativeDayStr.toLowerCase()) 
          : 1;
          
        return getRelativeNthDay(nextYear, nextMonth, relativeWeek, targetDayIdx);
      }
    }
    
    return fromDateStr;
  };

  const matchesRecurrence = (date: Date, startDate: Date, config: RecurrenceConfig): boolean => {
    if (date < startDate) return false;
    
    if (config.frequency === 'daily') {
      return true;
    }
    
    if (config.frequency === 'weekly') {
      const weekdays = config.weeklyDays || [];
      if (weekdays.length === 0) {
        return date.getDay() === startDate.getDay();
      }
      const dayNamesShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const currentDayName = dayNamesShort[date.getDay()];
      return weekdays.some(w => w.toLowerCase() === currentDayName.toLowerCase());
    }
    
    if (config.frequency === 'monthly') {
      if (config.monthlyType === 'specific_date') {
        const targetDay = config.monthlySpecificDate || startDate.getDate();
        return date.getDate() === targetDay;
      } else {
        const relativeWeek = config.monthlyRelativeWeek || 1;
        const relativeDayStr = config.monthlyRelativeDay || 'mon';
        const dayNamesShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const targetDayIdx = dayNamesShort.indexOf(relativeDayStr.toLowerCase());
        if (date.getDay() !== targetDayIdx) return false;
        
        const temp = new Date(date.getFullYear(), date.getMonth(), 1);
        let count = 0;
        while (temp.getMonth() === date.getMonth()) {
          if (temp.getDay() === targetDayIdx) {
            count++;
            if (temp.getDate() === date.getDate()) {
              break;
            }
          }
          temp.setDate(temp.getDate() + 1);
        }
        
        if (relativeWeek === -1) {
          const nextWeek = new Date(date);
          nextWeek.setDate(nextWeek.getDate() + 7);
          return nextWeek.getMonth() !== date.getMonth();
        }
        
        return count === relativeWeek;
      }
    }
    
    return false;
  };

  const replicateRecurringTask = (dateTasks: any, task: any, startDateStr: string, categoryName: string) => {
    const config = task.recurrence;
    if (!config) return dateTasks;
    
    const seriesId = task.seriesId || `series-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    task.seriesId = seriesId;
    
    const parts = startDateStr.split('-').map(Number);
    const startDate = new Date(parts[0], parts[1] - 1, parts[2]);
    
    const horizonDays = 1095; // 3 years
    const updatedDateTasks = { ...dateTasks };
    
    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + horizonDays);
    
    if (config.endCondition === 'until_date' && config.untilDate) {
      const untilParts = config.untilDate.split('-').map(Number);
      const untilDateObj = new Date(untilParts[0], untilParts[1] - 1, untilParts[2]);
      if (untilDateObj < endDate) {
        endDate = untilDateObj;
      }
    }
    
    const current = new Date(startDate);
    current.setDate(current.getDate() + 1); // Start replicating from the next day
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      
      if (matchesRecurrence(current, startDate, config)) {
        const categories = updatedDateTasks[dateStr] || [];
        
        const taskCopy = {
          ...task,
          id: `p-task-${Date.now()}-${current.getTime()}-${Math.random().toString(36).substr(2, 4)}`,
          date: dateStr,
          seriesId,
          completed: false
        };
        
        const targetCat = categoryName;
        const existingCatIdx = categories.findIndex((c: any) => c.name.toUpperCase() === targetCat.toUpperCase());
        
        let updatedCategories;
        if (existingCatIdx !== -1) {
          const existingCat = categories[existingCatIdx];
          const taskExists = (existingCat.tasks || []).some((t: any) => t.seriesId === seriesId || (t.title === task.title && t.time === task.time));
          if (!taskExists) {
            updatedCategories = [...categories];
            updatedCategories[existingCatIdx] = {
              ...existingCat,
              isOpen: true,
              tasks: [...(existingCat.tasks || []), taskCopy]
            };
          } else {
            updatedCategories = categories;
          }
        } else {
          updatedCategories = [
            ...categories,
            {
              id: `p-cat-${Date.now()}-${current.getTime()}`,
              name: targetCat,
              isOpen: true,
              tasks: [taskCopy]
            }
          ];
        }
        
        updatedDateTasks[dateStr] = updatedCategories;
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return updatedDateTasks;
  };

  // Toggles a subtask completion state in the daily power system
  const togglePowerTask = (dayId: string, categoryId: string, taskId: string, targetDateStr: string = "") => {
    if (targetDateStr) {
      setPowerSystem(prev => {
        const dateTasks = prev.dateTasks || {};
        const categories = getCategoriesForDate(targetDateStr);
        
        let recurringTaskToSchedule: { task: any; categoryName: string } | null = null;
        
        const updatedCategories = categories.map(cat => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            tasks: cat.tasks.map(t => {
              if (t.id !== taskId) return t;
              // If we are toggling from false to true AND recurrence is configured AND no seriesId (legacy fallback)
              if (!t.completed && t.recurrence && !t.seriesId) {
                recurringTaskToSchedule = {
                  task: t,
                  categoryName: cat.name
                };
              }
              return { ...t, completed: !t.completed };
            })
          };
        });
        
        let newDateTasks = {
          ...dateTasks,
          [targetDateStr]: updatedCategories
        };
        
        if (recurringTaskToSchedule) {
          const { task, categoryName } = recurringTaskToSchedule;
          const nextDateStr = getNextOccurrenceDate(targetDateStr, task.recurrence);
          
          let shouldSchedule = true;
          if (task.recurrence.endCondition === 'until_date' && task.recurrence.untilDate && nextDateStr > task.recurrence.untilDate) {
            shouldSchedule = false;
          }
          
          if (shouldSchedule) {
            const nextDayId = getWeekdayIdFromDate(nextDateStr);
            const nextCategories = newDateTasks[nextDateStr] || [];
            
            const nextTaskObj = {
              ...task,
              id: `p-task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              completed: false // Reset completion status
            };
            
            const existingCat = nextCategories.find(c => c.name.toUpperCase() === categoryName.toUpperCase());
            let updatedNextCategories;
            if (existingCat) {
              updatedNextCategories = nextCategories.map(c => {
                if (c.name.toUpperCase() !== categoryName.toUpperCase()) return c;
                return {
                  ...c,
                  isOpen: true,
                  tasks: [...c.tasks, nextTaskObj]
                };
              });
            } else {
              updatedNextCategories = [
                ...nextCategories,
                {
                  id: `p-cat-${Date.now()}`,
                  name: categoryName.toUpperCase(),
                  isOpen: true,
                  tasks: [nextTaskObj]
                }
              ];
            }
            
            newDateTasks[nextDateStr] = updatedNextCategories;
          }
        }
        
        return {
          ...prev,
          dateTasks: newDateTasks
        };
      });
      return;
    }
    // Blueprint fallback
    setPowerSystem(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          categories: day.categories.map(cat => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              tasks: cat.tasks.map(t => {
                if (t.id !== taskId) return t;
                return { ...t, completed: !t.completed };
              })
            };
          })
        };
      });
      return { ...prev, days: updatedDays };
    });
  };

  // Updates a power task title inside a specific day and category
  const updatePowerTaskTitle = (dayId: string, categoryId: string, taskId: string, newTitle: string, targetDateStr: string = "") => {
    if (targetDateStr) {
      setPowerSystem(prev => {
        const dateTasks = prev.dateTasks || {};
        const categories = getCategoriesForDate(targetDateStr);
        const updatedCategories = categories.map(cat => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            tasks: cat.tasks.map(t => {
              if (t.id !== taskId) return t;
              return { ...t, title: newTitle };
            })
          };
        });
        return {
          ...prev,
          dateTasks: {
            ...dateTasks,
            [targetDateStr]: updatedCategories
          }
        };
      });
      return;
    }
    setPowerSystem(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          categories: day.categories.map(cat => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              tasks: cat.tasks.map(t => {
                if (t.id !== taskId) return t;
                return { ...t, title: newTitle };
              })
            };
          })
        };
      });
      return { ...prev, days: updatedDays };
    });
  };

  // Updates a power category name inside a specific day
  const updatePowerCategoryName = (dayId: string, categoryId: string, newName: string, targetDateStr: string = "") => {
    if (targetDateStr) {
      setPowerSystem(prev => {
        const dateTasks = prev.dateTasks || {};
        const categories = getCategoriesForDate(targetDateStr);
        const updatedCategories = categories.map(cat => {
          if (cat.id !== categoryId) return cat;
          return { ...cat, name: newName.toUpperCase() };
        });
        return {
          ...prev,
          dateTasks: {
            ...dateTasks,
            [targetDateStr]: updatedCategories
          }
        };
      });
      return;
    }
    setPowerSystem(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          categories: day.categories.map(cat => {
            if (cat.id !== categoryId) return cat;
            return { ...cat, name: newName.toUpperCase() };
          })
        };
      });
      return { ...prev, days: updatedDays };
    });
  };

  // Adds a task to a category inside a specific day
  const addPowerTask = (dayId: string, categoryId: string, title: string, targetDateStr: string = "", timeStr?: string, goalTitle?: string) => {
    if (!title.trim()) return;
    const newTaskObj = {
      id: `p-task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      completed: false,
      time: timeStr || undefined,
      goalTitle: goalTitle || undefined
    };

    if (targetDateStr) {
      setPowerSystem(prev => {
        const dateTasks = prev.dateTasks || {};
        const categories = getCategoriesForDate(targetDateStr);
        const updatedCategories = categories.map(cat => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            tasks: [...cat.tasks, newTaskObj]
          };
        });
        return {
          ...prev,
          dateTasks: {
            ...dateTasks,
            [targetDateStr]: updatedCategories
          }
        };
      });
      return;
    }

    setPowerSystem(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          categories: day.categories.map(cat => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              tasks: [...cat.tasks, newTaskObj]
            };
          })
        };
      });
      return { ...prev, days: updatedDays };
    });
  };

  // Deletes a task from a category inside a specific day
  const deletePowerTask = (dayId: string, categoryId: string, taskId: string, targetDateStr: string = "", deleteAllSeries: boolean = false) => {
    if (targetDateStr) {
      setPowerSystem(prev => {
        const dateTasks = prev.dateTasks || {};
        
        if (deleteAllSeries) {
          let targetSeriesId: string | undefined;
          const categories = dateTasks[targetDateStr] || [];
          for (const cat of categories) {
            const t = cat.tasks.find((tk: any) => tk.id === taskId);
            if (t && t.seriesId) {
              targetSeriesId = t.seriesId;
              break;
            }
          }
          
          if (targetSeriesId) {
            const newDateTasks = { ...dateTasks };
            Object.keys(newDateTasks).forEach(dStr => {
              if (dStr >= targetDateStr) {
                const cats = newDateTasks[dStr] || [];
                newDateTasks[dStr] = cats.map((cat: any) => ({
                  ...cat,
                  tasks: cat.tasks.filter((t: any) => t.seriesId !== targetSeriesId)
                })).filter((cat: any) => cat.tasks.length > 0);
              }
            });
            return {
              ...prev,
              dateTasks: newDateTasks
            };
          }
        }
        
        const categories = getCategoriesForDate(targetDateStr);
        const updatedCategories = categories.map(cat => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            tasks: cat.tasks.filter(t => t.id !== taskId)
          };
        });
        return {
          ...prev,
          dateTasks: {
            ...dateTasks,
            [targetDateStr]: updatedCategories
          }
        };
      });
      return;
    }
    setPowerSystem(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          categories: day.categories.map(cat => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              tasks: cat.tasks.filter(t => t.id !== taskId)
            };
          })
        };
      });
      return { ...prev, days: updatedDays };
    });
  };

  // Toggles open/closed state of a category
  const togglePowerCategoryOpen = (dayId: string, categoryId: string, targetDateStr: string = "") => {
    if (targetDateStr) {
      setPowerSystem(prev => {
        const dateTasks = prev.dateTasks || {};
        const categories = getCategoriesForDate(targetDateStr);
        const updatedCategories = categories.map(cat => {
          if (cat.id !== categoryId) return cat;
          return { ...cat, isOpen: cat.isOpen === undefined ? true : !cat.isOpen };
        });
        return {
          ...prev,
          dateTasks: {
            ...dateTasks,
            [targetDateStr]: updatedCategories
          }
        };
      });
      return;
    }
    setPowerSystem(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          categories: day.categories.map(cat => {
            if (cat.id !== categoryId) return cat;
            return { ...cat, isOpen: cat.isOpen === undefined ? true : !cat.isOpen };
          })
        };
      });
      return { ...prev, days: updatedDays };
    });
  };

  // Adds a category to a specific day
  const addPowerCategory = (dayId: string, name: string, targetDateStr: string = "") => {
    if (!name.trim()) return;
    const newCatObj = {
      id: `p-cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim().toUpperCase(),
      isOpen: true,
      tasks: []
    };

    if (targetDateStr) {
      setPowerSystem(prev => {
        const dateTasks = prev.dateTasks || {};
        const categories = getCategoriesForDate(targetDateStr);
        return {
          ...prev,
          dateTasks: {
            ...dateTasks,
            [targetDateStr]: [...categories, newCatObj]
          }
        };
      });
      return;
    }

    setPowerSystem(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          categories: [...day.categories, newCatObj]
        };
      });
      return { ...prev, days: updatedDays };
    });
  };

  // Deletes a category from a day
  const deletePowerCategory = (dayId: string, categoryId: string, targetDateStr: string = "") => {
    if (targetDateStr) {
      setPowerSystem(prev => {
        const dateTasks = prev.dateTasks || {};
        const categories = getCategoriesForDate(targetDateStr);
        return {
          ...prev,
          dateTasks: {
            ...dateTasks,
            [targetDateStr]: categories.filter(cat => cat.id !== categoryId)
          }
        };
      });
      return;
    }
    setPowerSystem(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          categories: day.categories.filter(cat => cat.id !== categoryId)
        };
      });
      return { ...prev, days: updatedDays };
    });
  };

  // --- INTEGRATED POWER WORKFLOW HELPERS ---
  const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getTodayDayObject = () => {
    if (powerDate) {
      const [year, month, day] = powerDate.split('-').map(Number);
      if (year && month && day) {
        const localDate = new Date(year, month - 1, day);
        const dayIdx = localDate.getDay();
        const dayId = daysOfWeek[dayIdx];
        return powerSystem.days.find(day => day.id === dayId) || powerSystem.days[0];
      }
    }
    const d = new Date().getDay();
    const dayId = daysOfWeek[d];
    return powerSystem.days.find(day => day.id === dayId) || powerSystem.days[0];
  };

  const getTomorrowDayObject = () => {
    if (powerDate) {
      const [year, month, day] = powerDate.split('-').map(Number);
      if (year && month && day) {
        const localDate = new Date(year, month - 1, day);
        localDate.setDate(localDate.getDate() + 1);
        const dayIdx = localDate.getDay();
        const dayId = daysOfWeek[dayIdx];
        return powerSystem.days.find(day => day.id === dayId) || powerSystem.days[1];
      }
    }
    const d = (new Date().getDay() + 1) % 7;
    const dayId = daysOfWeek[d];
    return powerSystem.days.find(day => day.id === dayId) || powerSystem.days[1];
  };

  const addGoalLinkedPowerTask = (dayId: string, isCustomCat: boolean, targetDateStr: string = "") => {
    if (!powerTaskTitle.trim()) return;
    const catName = (isCustomCat ? powerCustomCategory : powerTaskCategory).trim().toUpperCase() || 'CORE FOCUS';
    
    // Find goal title if selected
    const linkedGoal = goals.find(g => g.id === powerTaskGoalId);
    const goalTitle = linkedGoal ? linkedGoal.title : undefined;

    const seriesId = recurrenceConfig ? `series-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` : undefined;
    const newTaskObj = {
      id: `p-task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: powerTaskTitle.trim(),
      completed: false,
      goalTitle,
      time: powerTaskTime || undefined,
      recurrence: recurrenceConfig ? recurrenceConfig : undefined,
      seriesId
    };

    if (targetDateStr) {
      setPowerSystem(prev => {
        const dateTasks = prev.dateTasks || {};
        const categories = getCategoriesForDate(targetDateStr);
        
        const existingCat = categories.find(c => c.name.toUpperCase() === catName.toUpperCase());
        let updatedCategories;
        if (existingCat) {
          updatedCategories = categories.map(c => {
            if (c.name.toUpperCase() !== catName.toUpperCase()) return c;
            return {
              ...c,
              isOpen: true,
              tasks: [...c.tasks, newTaskObj]
            };
          });
        } else {
          updatedCategories = [
            ...categories,
            {
              id: `p-cat-${Date.now()}`,
              name: catName,
              isOpen: true,
              tasks: [newTaskObj]
            }
          ];
        }

        let newDateTasks = {
          ...dateTasks,
          [targetDateStr]: updatedCategories
        };

        if (newTaskObj.recurrence) {
          newDateTasks = replicateRecurringTask(newDateTasks, newTaskObj, targetDateStr, catName);
        }

        return {
          ...prev,
          dateTasks: newDateTasks
        };
      });
    } else {
      setPowerSystem(prev => {
        const updatedDays = prev.days.map(day => {
          if (day.id !== dayId) return day;
          
          const existingCat = day.categories.find(c => c.name.toUpperCase() === catName.toUpperCase());
          let updatedCategories;
          if (existingCat) {
            updatedCategories = day.categories.map(c => {
              if (c.name.toUpperCase() !== catName.toUpperCase()) return c;
              return {
                ...c,
                isOpen: true,
                tasks: [...c.tasks, newTaskObj]
              };
            });
          } else {
            updatedCategories = [
              ...day.categories,
              {
                id: `p-cat-${Date.now()}`,
                name: catName,
                isOpen: true,
                tasks: [newTaskObj]
              }
            ];
          }

          return {
            ...day,
            categories: updatedCategories
          };
        });

        return { ...prev, days: updatedDays };
      });
    }

    setPowerTaskTitle('');
    setPowerTaskGoalId('');
    setPowerCustomCategory('');
    setPowerTaskTime('');
    setRecurrenceConfig(null);
  };

  const submitEveningReport = () => {
    const todayDay = getTodayDayObject();
    const todayCategories = getCategoriesForDate(powerDate);
    
    let totalTasksCount = 0;
    let completedTasksCount = 0;
    
    todayCategories.forEach(cat => {
      cat.tasks.forEach(t => {
        totalTasksCount++;
        if (t.completed) completedTasksCount++;
      });
    });

    if (totalTasksCount === 0) {
      alert("No tasks defined in today's power system blueprint! Plan some work first.");
      return;
    }

    // Rollover tomorrow's tasks to today, and reset tomorrow
    const tomorrowDay = getTomorrowDayObject();
    
    setPowerSystem(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.id === todayDay.id) {
          return {
            ...day,
            categories: tomorrowDay.categories.map(cat => ({
              ...cat,
              tasks: cat.tasks.map(t => ({ ...t, completed: false }))
            }))
          };
        }
        if (day.id === tomorrowDay.id) {
          return {
            ...day,
            categories: [
              {
                id: `cat-default-${Date.now()}`,
                name: "CORE FOCUS",
                isOpen: true,
                tasks: []
              }
            ]
          };
        }
        return day;
      });

      return { ...prev, days: updatedDays };
    });

    setEveningNotes('');
    setActiveSubTab('power');
    console.log(`Success! Evening report for ${todayDay.dayName} submitted.`);
  };

  const getDayCompletionStats = (dateStr: string) => {
    const dayId = getWeekdayIdFromDate(dateStr);
    if (dayId === 'sun') {
      return { completed: 0, total: 0, percent: 0, isRest: true };
    }
    const categories = getCategoriesForDate(dateStr);
    if (categories.length === 0) return { completed: 0, total: 0, percent: 0, isRest: false };

    let total = 0;
    let completed = 0;
    categories.forEach(cat => {
      cat.tasks.forEach(t => {
        total++;
        if (t.completed) completed++;
      });
    });

    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      isRest: false
    };
  };

  const getPerfCalendarDays = (viewDate: Date) => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const startDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevMonthLastDay = new Date(y, m, 0).getDate();
    
    const daysList = [];
    
    // Previous month days padding
    for (let i = startDay - 1; i >= 0; i--) {
      const prevDate = new Date(y, m - 1, prevMonthLastDay - i);
      const mStr = (m === 0 ? 12 : m).toString().padStart(2, '0');
      const yStr = (m === 0 ? y - 1 : y).toString();
      const dStr = (prevMonthLastDay - i).toString().padStart(2, '0');
      daysList.push({
        dayNum: prevMonthLastDay - i,
        isCurrentMonth: false,
        dateStr: `${yStr}-${mStr}-${dStr}`,
        date: prevDate
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const monthStr = (m + 1).toString().padStart(2, '0');
      const dayStr = i.toString().padStart(2, '0');
      daysList.push({
        dayNum: i,
        isCurrentMonth: true,
        dateStr: `${y}-${monthStr}-${dayStr}`,
        date: new Date(y, m, i)
      });
    }
    
    // Next month days padding to make 6 rows (42 cells)
    const remainingSlots = 42 - daysList.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextDate = new Date(y, m + 1, i);
      const mStr = (m === 11 ? 1 : m + 2).toString().padStart(2, '0');
      const yStr = (m === 11 ? y + 1 : y).toString();
      const dStr = i.toString().padStart(2, '0');
      daysList.push({
        dayNum: i,
        isCurrentMonth: false,
        dateStr: `${yStr}-${mStr}-${dStr}`,
        date: nextDate
      });
    }
    
    return daysList;
  };

  // Formatting clock
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const selectedTaskForTimer = tasks.find(t => t.id === activeTimerTaskId);

  // Progress percentage of active timer
  const originalDuration = customDuration;
  const progressPercent = customDuration > 0 ? ((customDuration - secondsLeft) / customDuration) * 100 : 0;

  // Task filtering logic
  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'pending') return t.status !== 'completed';
    if (taskFilter === 'completed') return t.status === 'completed';
    return true;
  });

  const handleAIAddSuggestedTask = (title: string, category: string, goalTitle?: string) => {
    const dayId = getWeekdayIdFromDate(powerDate);
    const categories = getCategoriesForDate(powerDate);
    let targetCat = categories.find(c => c.name.toUpperCase() === category.toUpperCase());
    
    let categoryId = '';
    if (targetCat) {
      categoryId = targetCat.id;
    } else {
      addPowerCategory(dayId, category, powerDate);
      const updatedCats = getCategoriesForDate(powerDate);
      const found = updatedCats.find(c => c.name.toUpperCase() === category.toUpperCase());
      categoryId = found ? found.id : `p-cat-${Date.now()}`;
    }
    
    addPowerTask(dayId, categoryId, title, powerDate, '10:00 AM', goalTitle);
  };

  return (
    <div className="space-y-6" id="productivity-hub-workspace">
      
      {/* Sub Tabs for Workspace */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto scrollbar-thin">
        <button 
          onClick={() => setActiveSubTab('power')}
          className={`px-4 py-3 text-[11px] font-mono font-bold tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'power' 
              ? 'border-red-500 text-red-600 dark:text-red-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-red-500 dark:text-red-400" /> 🎯 POWER SYSTEM
        </button>

        <button 
          onClick={() => setActiveSubTab('ai_assistant')}
          className={`px-4 py-3 text-[11px] font-mono font-bold tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'ai_assistant' 
              ? 'border-purple-500 text-purple-600 dark:text-purple-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400 animate-pulse" /> 🔮 AI ASSISTANT
        </button>

        <button 
          onClick={() => setActiveSubTab('focus')}
          className={`px-4 py-3 text-[11px] font-mono font-bold tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'focus' 
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" /> ⏱️ FOCUS WORK TIMER
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Deactivated Legacy Focus section */}
        {false && (
          <motion.div 
            key="focus-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            id="pomodoro-timer-view"
          >
            {/* Left 2 Columns: Circular Clock Panel */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col items-center justify-between text-center min-h-[440px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none glow-bg-1" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none glow-bg-2" />

              <div className="w-full flex justify-between items-center border-b border-slate-800/60 pb-3 z-10">
                <span className="text-xs font-mono uppercase text-cyan-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 animate-pulse" /> FOCUS EXECUTIVE TIMER
                </span>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsSoundOn(!isSoundOn)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
                  >
                    {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setIsFocusOverlayActive(true)}
                    className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-mono flex items-center gap-1 transition-all"
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> Full Screen
                  </button>
                </div>
              </div>

              {/* Modes Selection */}
              <div className="flex gap-2.5 my-4 bg-slate-950/40 p-1 rounded-xl border border-slate-800 z-10">
                <button 
                  onClick={() => resetTimerMode('focus')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    timerMode === 'focus' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Focus Session
                </button>
                <button 
                  onClick={() => resetTimerMode('short')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    timerMode === 'short' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Short Break
                </button>
                <button 
                  onClick={() => resetTimerMode('long')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    timerMode === 'long' ? 'bg-blue-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Long Break
                </button>
              </div>

              {/* Circular Ring Timer */}
              <div className="relative my-6 z-10 flex items-center justify-center">
                <svg className="w-56 h-56 transform -rotate-90">
                  <circle 
                    cx="112" 
                    cy="112" 
                    r="96" 
                    stroke="rgba(255,255,255,0.03)" 
                    strokeWidth="8" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="112" 
                    cy="112" 
                    r="96" 
                    stroke={timerMode === 'focus' ? '#06b6d4' : timerMode === 'short' ? '#10b981' : '#3b82f6'} 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 96}
                    strokeDashoffset={2 * Math.PI * 96 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>

                {/* Counter text inside ring */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-display font-bold font-mono tracking-tight text-slate-100">
                    {formatTime(secondsLeft)}
                  </span>
                  <span className="text-[9px] font-mono uppercase text-slate-500 mt-1 tracking-wider">
                    {timerMode === 'focus' ? 'CONCENTRATION' : 'RECOVERY'}
                  </span>
                </div>
              </div>

              {/* Core controls */}
              <div className="flex items-center gap-4 z-10 my-2">
                <button 
                  onClick={() => resetTimerMode(timerMode)}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-all"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-8 py-3 rounded-2xl font-mono text-sm font-bold flex items-center gap-2 shadow-lg transition-all ${
                    isTimerRunning
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:shadow-cyan-500/10'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  {isTimerRunning ? 'Pause Session' : 'Begin Focus'}
                </button>
              </div>

              {/* Associated active Task details */}
              <div className="w-full border-t border-slate-800/60 pt-4 text-center z-10">
                {selectedTaskForTimer ? (
                  <div>
                    <span className="text-[9px] font-mono uppercase text-slate-500">Currently Synchronized Focus Node</span>
                    <h4 className="text-sm font-display font-medium text-slate-200 mt-1 line-clamp-1">{selectedTaskForTimer.title}</h4>
                    <p className="text-[10px] text-cyan-400 font-mono mt-0.5">
                      Completed cycles: {selectedTaskForTimer.pomodorosCompleted} / {selectedTaskForTimer.pomodorosEstimated} Pomodoros
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="text-[9px] font-mono uppercase text-slate-500">No synchronized focus task selected</span>
                    <p className="text-xs text-slate-400 mt-1">Select an active task from the list to update its Pomodoro cycle logs automatically.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Custom Duration Configurator */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col justify-between min-h-[440px] text-left">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Settings className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                    <h3 className="text-sm font-display font-medium text-slate-100 uppercase tracking-wider">
                      MANUAL TIMER SETUP
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Fine-tune your cognitive blocks. Adjust the duration manually or select a professional time preset.
                  </p>
                </div>

                {/* Numeric Manual Input Control */}
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                    Custom Focus Period
                  </label>
                  
                  <div className="flex items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    <button 
                      type="button"
                      onClick={() => {
                        const val = Math.max(1, customMinutes - 5);
                        setCustomMinutes(val);
                        if (!isTimerRunning) {
                          setSecondsLeft(val * 60);
                          setCustomDuration(val * 60);
                        }
                      }}
                      className="w-8 h-8 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold flex items-center justify-center transition-all text-sm select-none"
                    >
                      -5
                    </button>
                    
                    <div className="flex flex-col items-center">
                      <div className="flex items-baseline">
                        <input 
                          type="number"
                          min="1"
                          max="360"
                          value={customMinutes}
                          onChange={(e) => {
                            const val = Math.min(360, Math.max(1, parseInt(e.target.value) || 25));
                            setCustomMinutes(val);
                            if (!isTimerRunning) {
                              setSecondsLeft(val * 60);
                              setCustomDuration(val * 60);
                            }
                          }}
                          className="bg-transparent text-center font-mono text-3xl font-bold text-cyan-400 w-16 focus:outline-none focus:ring-0"
                        />
                        <span className="text-xs text-slate-500 font-mono">min</span>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => {
                        const val = Math.min(360, customMinutes + 5);
                        setCustomMinutes(val);
                        if (!isTimerRunning) {
                          setSecondsLeft(val * 60);
                          setCustomDuration(val * 60);
                        }
                      }}
                      className="w-8 h-8 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold flex items-center justify-center transition-all text-sm select-none"
                    >
                      +5
                    </button>
                  </div>
                </div>

                {/* Visual Duration Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>1 Min</span>
                    <span>180 Min</span>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="180"
                    value={customMinutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 25;
                      setCustomMinutes(val);
                      if (!isTimerRunning) {
                        setSecondsLeft(val * 60);
                        setCustomDuration(val * 60);
                      }
                    }}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                {/* Professional Sprints Presets */}
                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                    Focus Block Presets
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCustomMinutes(25);
                        resetTimerMode('focus', 25);
                      }}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        customMinutes === 25 && timerMode === 'focus'
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-semibold font-mono">25m Sprint</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Classic Pomodoro</div>
                    </button>

                    <button
                      onClick={() => {
                        setCustomMinutes(45);
                        resetTimerMode('focus', 45);
                      }}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        customMinutes === 45 && timerMode === 'focus'
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-semibold font-mono">45m Block</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Standard Sizing</div>
                    </button>

                    <button
                      onClick={() => {
                        setCustomMinutes(60);
                        resetTimerMode('focus', 60);
                      }}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        customMinutes === 60 && timerMode === 'focus'
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-semibold font-mono">60m Deep</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Extended Focus</div>
                    </button>

                    <button
                      onClick={() => {
                        setCustomMinutes(90);
                        resetTimerMode('focus', 90);
                      }}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        customMinutes === 90 && timerMode === 'focus'
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-semibold font-mono">90m Flow</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Elite Level Block</div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl mt-4">
                <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                  💡 EXECUTIVE TIP
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Deep focus requires custom block sizing. Pick your duration, set your phone to Do Not Disturb, and execute single-mindedly.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'power' && (
          <motion.div
            key="power-section-v2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <ExecutionCore
              powerDate={powerDate}
              setPowerDate={setPowerDate}
              powerSystem={powerSystem}
              setPowerSystem={setPowerSystem}
              goals={goals}
              addPowerCategory={addPowerCategory}
              deletePowerCategory={deletePowerCategory}
              addPowerTask={addPowerTask}
              deletePowerTask={deletePowerTask}
              togglePowerTask={togglePowerTask}
              updatePowerTaskTitle={updatePowerTaskTitle}
              importBlueprintToDate={importBlueprintToDate}
              getCategoriesForDate={getCategoriesForDate}
              getTodayDayObject={getTodayDayObject}
              getWeekdayIdFromDate={getWeekdayIdFromDate}
              eveningNotes={eveningNotes}
              setEveningNotes={setEveningNotes}
              submitEveningReport={submitEveningReport}
            />
          </motion.div>
        )}

        {activeSubTab === 'ai_assistant' && (
          <motion.div
            key="ai-assistant-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <AIPredictions 
              goals={goals} 
              categories={['CORE FOCUS', 'WEALTH CREATION', 'BECOME INCREDIBLY MUSCULAR', 'BECOME INCREDIBLY INTELLIGENT']} 
              onAddSuggestedTask={handleAIAddSuggestedTask} 
            />
          </motion.div>
        )}

        {false && activeSubTab === 'power' && (() => {
          const [year, month, day] = powerDate.split('-').map(Number);
          const localDate = new Date(year, month - 1, day);
          localDate.setDate(localDate.getDate() + 1);
          const tomorrowDateStr = localDate.toISOString().split('T')[0];

          const todayCategories = getCategoriesForDate(powerDate);
          const tomorrowCategories = getCategoriesForDate(tomorrowDateStr);

          return (
            <motion.div
              key="power-system-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-left"
            >
              {/* iOS Styled Premium Header Banner */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-mono text-[9px] tracking-widest font-bold uppercase">Executive Engine</span>
                      <span className="text-slate-500 text-xs font-mono">• 4. Power System</span>
                    </div>
                    <h2 className="text-lg font-display font-semibold text-slate-100 tracking-tight flex items-center gap-2">
                      🎯 DAILY POWER PLANNER
                    </h2>
                    <p className="text-red-400 font-mono text-xs font-bold uppercase tracking-wider mt-1.5">
                      FOR THE FIRST TIME IN YOUR LIFE, USE POWER.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Rule of thumb: Plan tomorrow tonight. Commit to your execution checklist and log your results every evening. Maintain a 50% weekly floor.
                    </p>
                  </div>

                  {/* Overall Stats summary */}
                  <div className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl flex items-center gap-3">
                    <Award className="w-8 h-8 text-amber-400" />
                    <div>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Weekly Floor Target</p>
                      <p className="text-sm font-mono font-bold text-slate-200">
                        &gt; 50% Completion
                      </p>
                      <p className="text-[9px] text-emerald-400 font-mono mt-0.5">Rule of Executive Momentum</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium segmented workspace view switcher */}
              <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 max-w-xl">
                <button 
                  type="button"
                  onClick={() => setPowerPlanView('today')}
                  className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    powerPlanView === 'today' ? 'bg-red-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" /> TODAY'S WORKSPACE
                </button>
                <button 
                  type="button"
                  onClick={() => setPowerPlanView('tomorrow')}
                  className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    powerPlanView === 'tomorrow' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" /> PLAN TOMORROW
                </button>
                <button 
                  type="button"
                  onClick={() => setPowerPlanView('full')}
                  className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    powerPlanView === 'full' ? 'bg-blue-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" /> WEEKLY BLUEPRINTS
                </button>
              </div>

              {/* Executive Day Summary Panel */}
              {(() => {
                const categories = getCategoriesForDate(powerDate);
                let total = 0;
                let completed = 0;
                categories.forEach(cat => {
                  cat.tasks.forEach(t => {
                    total++;
                    if (t.completed) completed++;
                  });
                });
                const pending = total - completed;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-900/10 border border-slate-850 p-4 rounded-2xl">
                    <div className="bg-slate-950/20 p-3 rounded-xl border border-slate-900/60 flex flex-col justify-center">
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Selected Date</div>
                      <div className="text-sm font-semibold text-slate-200 mt-1 font-mono">
                        {(() => {
                          const [y, m, d] = powerDate.split('-').map(Number);
                          const locD = new Date(y, m - 1, d);
                          return locD.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
                        })()}
                      </div>
                    </div>
                    
                    <div className="bg-slate-950/20 p-3 rounded-xl border border-slate-900/60 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Completed Tasks</div>
                        <div className="text-2xl font-bold font-mono text-slate-100 mt-0.5">{completed}</div>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 bg-slate-950/40 px-2 py-1 rounded-md border border-slate-900/50">Done</div>
                    </div>

                    <div className="bg-slate-950/20 p-3 rounded-xl border border-slate-900/60 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">Pending Tasks</div>
                        <div className="text-2xl font-bold font-mono text-slate-100 mt-0.5">{pending}</div>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 bg-slate-950/40 px-2 py-1 rounded-md border border-slate-900/50">To-Do</div>
                    </div>

                    <div className="bg-slate-950/20 p-3 rounded-xl border border-slate-900/60 space-y-2 flex flex-col justify-center">
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Day Efficiency</div>
                        <div className="text-xs font-mono font-bold text-slate-200">{percent}%</div>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${percent >= 50 ? 'bg-emerald-500' : 'bg-red-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* --- WORKSPACE VIEWS --- */}
              {powerPlanView === 'today' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Columns: Today's Tasks & Execution Checklist */}
                  <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <h3 className="text-base font-display font-bold text-slate-100 uppercase tracking-wide">
                          🔥 ACTIVE BLUEPRINT ({(() => {
                            const [y, m, d] = powerDate.split('-').map(Number);
                            const locD = new Date(y, m - 1, d);
                            return locD.toLocaleDateString('en-US', { weekday: 'long' });
                          })()})
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/60 shadow-sm">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Select Date:</span>
                        <input 
                          type="date"
                          value={powerDate}
                          onChange={(e) => setPowerDate(e.target.value)}
                          className="bg-transparent text-xs font-mono text-cyan-400 focus:outline-none cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Add action step form */}
                    <form onSubmit={(e) => { e.preventDefault(); addGoalLinkedPowerTask(getTodayDayObject().id, powerTaskCategory === 'CUSTOM', powerDate); }} style={{ width: '653.328125px', maxWidth: '100%' }} className="space-y-3 bg-slate-950/40 border border-slate-800 p-4 rounded-xl">
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Add Action to Today's Blueprint</div>
                      
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <div className="relative flex-1 flex items-center">
                          <input 
                            type="text"
                            placeholder="Define next action step..."
                            value={powerTaskTitle}
                            onChange={(e) => setPowerTaskTitle(e.target.value)}
                            className="bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-red-500 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none w-full transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (recurrenceConfig) {
                                setModalFreqType(recurrenceConfig.frequency);
                                setModalWeeklyDays(recurrenceConfig.weeklyDays || ['mon', 'tue', 'wed', 'thu', 'fri']);
                                setModalMonthlyType(recurrenceConfig.monthlyType || 'specific_date');
                                setModalMonthlySpecificDate(recurrenceConfig.monthlySpecificDate || 1);
                                setModalMonthlyRelativeWeek(recurrenceConfig.monthlyRelativeWeek || 1);
                                setModalMonthlyRelativeDay(recurrenceConfig.monthlyRelativeDay || 'mon');
                                setModalEndCondition(recurrenceConfig.endCondition);
                                setModalUntilDate(recurrenceConfig.untilDate || new Date().toISOString().split('T')[0]);
                              }
                              setIsRecurrenceModalOpen(true);
                            }}
                            className={`absolute right-2.5 p-1 rounded-md transition-all cursor-pointer ${
                              recurrenceConfig ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
                            }`}
                            title={recurrenceConfig ? `Repeat Configured: ${recurrenceConfig.frequency.toUpperCase()}` : "Configure Recurrence/Repeat Frequency"}
                          >
                            <Repeat className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <input 
                              type="time"
                              value={powerTaskTime}
                              onChange={(e) => setPowerTaskTime(e.target.value)}
                              className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none border-none p-0 cursor-pointer"
                            />
                          </div>

                          <select 
                            value={powerTaskGoalId}
                            onChange={(e) => setPowerTaskGoalId(e.target.value)}
                            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none transition-all sm:max-w-[180px]"
                          >
                            <option value="">🔗 Link to Goal...</option>
                            {goals.map(g => (
                              <option key={g.id} value={g.id}>{g.title}</option>
                            ))}
                          </select>
                        </div>

                        <select 
                          value={powerTaskCategory}
                          onChange={(e) => setPowerTaskCategory(e.target.value)}
                          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none transition-all sm:max-w-[160px]"
                        >
                          <option value="WEALTH CREATION">Wealth Creation</option>
                          <option value="BECOME INCREDIBLY MUSCULAR">Physical Muscle</option>
                          <option value="BECOME INCREDIBLY INTELLIGENT">Intelligence Growth</option>
                          <option value="CRACK EXAMS">Exam Conquest</option>
                          <option value="CUSTOM">-- Custom Category --</option>
                        </select>
                      </div>

                      {powerTaskCategory === 'CUSTOM' && (
                        <input 
                          type="text"
                          placeholder="Type custom category name..."
                          value={powerCustomCategory}
                          onChange={(e) => setPowerCustomCategory(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none transition-all"
                        />
                      )}

                      {recurrenceConfig && (
                        <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2 text-[10px] text-emerald-400 font-mono">
                          <Repeat className="w-3 h-3 animate-pulse" />
                          <span>
                            ACTIVE RECURRENCE: <strong className="uppercase">{recurrenceConfig.frequency}</strong> 
                            {recurrenceConfig.frequency === 'weekly' && recurrenceConfig.weeklyDays && ` (${recurrenceConfig.weeklyDays.map(d => d.toUpperCase()).join(', ')})`}
                            {recurrenceConfig.frequency === 'monthly' && recurrenceConfig.monthlyType === 'specific_date' && ` (Day ${recurrenceConfig.monthlySpecificDate})`}
                            {recurrenceConfig.frequency === 'monthly' && recurrenceConfig.monthlyType === 'relative_day' && ` (${recurrenceConfig.monthlyRelativeWeek === -1 ? 'Last' : `${recurrenceConfig.monthlyRelativeWeek}n`} ${recurrenceConfig.monthlyRelativeDay.toUpperCase()})`}
                            {recurrenceConfig.endCondition === 'until_date' ? ` UNTIL ${recurrenceConfig.untilDate}` : ' FOREVER'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setRecurrenceConfig(null)}
                            className="ml-auto text-slate-500 hover:text-red-400 text-[9px] font-bold uppercase transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      <button 
                        type="submit"
                        className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-mono text-[10px] py-1.5 rounded-lg font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Append Goal-Linked Task
                      </button>
                    </form>

                    {/* Active List */}
                    <div className="space-y-4">
                      {todayCategories.length === 0 || todayCategories.every(c => c.tasks.length === 0) ? (
                        <div className="text-center py-10 text-slate-500 text-xs space-y-3.5">
                          <Flame className="w-8 h-8 text-slate-600 mx-auto mb-1 animate-pulse" />
                          <p className="text-slate-400">No active blueprint steps exist for this date.</p>
                          <button
                            type="button"
                            onClick={() => importBlueprintToDate(powerDate)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-mono text-[10px] rounded-lg font-bold transition-all uppercase tracking-wider cursor-pointer shadow-sm"
                          >
                            Load {(() => {
                              const [y, m, d] = powerDate.split('-').map(Number);
                              const locD = new Date(y, m - 1, d);
                              return locD.toLocaleDateString('en-US', { weekday: 'long' });
                            })()} Blueprint Template
                          </button>
                        </div>
                      ) : (
                        todayCategories.map(category => (
                          <div key={category.id} className="border-l-2 border-red-500/60 pl-3 py-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{category.name}</span>
                              <button 
                                type="button"
                                onClick={() => deletePowerCategory(getTodayDayObject().id, category.id, powerDate)}
                                className="text-[9px] font-mono text-slate-600 hover:text-red-400 transition-all"
                              >
                                Delete Column
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              <AnimatePresence mode="popLayout">
                                {category.tasks.map(task => (
                                  <motion.div 
                                    key={task.id} 
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center justify-between gap-3 bg-slate-950/20 p-2.5 rounded-lg border border-slate-900/60 group hover:border-slate-800/80 transition-all"
                                  >
                                    <div className="flex items-center gap-2.5 flex-1">
                                      <button
                                        type="button"
                                        onClick={() => togglePowerTask(getTodayDayObject().id, category.id, task.id, powerDate)}
                                        className="focus:outline-none"
                                        title={task.completed ? "Mark pending" : "Mark completed"}
                                      >
                                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                          task.completed 
                                            ? 'bg-red-500 border-red-500 text-slate-950 shadow-sm' 
                                            : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                                        }`}>
                                          {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                      </button>
                                      
                                      <div className="flex-1 flex flex-col text-left">
                                        <input 
                                          type="text"
                                          value={task.title}
                                          onChange={(e) => updatePowerTaskTitle(getTodayDayObject().id, category.id, task.id, e.target.value, powerDate)}
                                          className={`bg-transparent border-b border-transparent hover:border-slate-800 focus:border-red-500/60 text-xs py-0.5 focus:outline-none transition-all w-full focus:bg-slate-900/40 rounded px-1 ${
                                            task.completed ? 'text-slate-500 line-through' : 'text-slate-200 focus:text-slate-100'
                                          }`}
                                        />
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                          {task.time && (
                                            <span className="text-[9px] text-amber-400 font-mono flex items-center gap-0.5 bg-amber-500/10 px-1 py-0.5 rounded">
                                              <Clock className="w-2.5 h-2.5" /> {task.time}
                                            </span>
                                          )}
                                          {task.goalTitle && (
                                            <span className="text-[9px] text-cyan-400 font-mono flex items-center gap-0.5 bg-cyan-500/10 px-1 py-0.5 rounded">
                                              <Target className="w-2.5 h-2.5" /> {task.goalTitle}
                                            </span>
                                          )}
                                          {task.recurrence && (
                                            <span 
                                              className="text-[9px] text-emerald-400 font-mono flex items-center gap-0.5 bg-emerald-500/10 px-1 py-0.5 rounded cursor-help"
                                              title={`Repeats ${task.recurrence.frequency}${task.recurrence.endCondition === 'until_date' ? ` until ${task.recurrence.untilDate}` : ''}`}
                                            >
                                              <Repeat className="w-2.5 h-2.5" /> {task.recurrence.frequency.toUpperCase()}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <button 
                                      type="button"
                                      onClick={() => deletePowerTask(getTodayDayObject().id, category.id, task.id, powerDate)}
                                      className="opacity-70 hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                                      title="Delete task"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Evening Checkout Desk */}
                  <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col justify-between min-h-[460px]">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <h3 className="text-sm font-display font-bold text-slate-100 uppercase tracking-wider">
                            🌙 EVENING RECKONING
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          At evening time, reflect on your execution blocks, record achievements, and publish your permanent report.
                        </p>
                      </div>

                      {/* Reflection input */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                          Evening Reflection Notes
                        </label>
                        <textarea 
                          rows={4}
                          placeholder="Reflect on your executions, blockers, mental state, and lessons learned..."
                          value={eveningNotes}
                          onChange={(e) => setEveningNotes(e.target.value)}
                          className="w-full bg-slate-950/60 border border-slate-800 focus:border-red-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all resize-none"
                        />
                      </div>

                      {/* Progress rating */}
                      <div className="space-y-2 bg-slate-950/40 p-3.5 border border-slate-800 rounded-xl">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-mono">Today's Progress</span>
                          <span className={`font-mono font-bold ${
                            (() => {
                              let total = 0; let done = 0;
                              todayCategories.forEach(c => c.tasks.forEach(t => { total++; if (t.completed) done++; }));
                              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                              return pct >= 50 ? 'text-emerald-400' : 'text-red-400';
                            })()
                          }`}>
                            {(() => {
                              let total = 0; let done = 0;
                              todayCategories.forEach(c => c.tasks.forEach(t => { total++; if (t.completed) done++; }));
                              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                              return `${done} / ${total} tasks (${pct}%)`;
                            })()}
                          </span>
                        </div>

                        {/* iOS styled progress bar */}
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                          {(() => {
                            let total = 0; let done = 0;
                            todayCategories.forEach(c => c.tasks.forEach(t => { total++; if (t.completed) done++; }));
                            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                            return (
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${pct >= 50 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            );
                          })()}
                        </div>
                        <p className="text-[9px] text-slate-500 leading-normal">
                          *Keep completion above 50% to maintain a highly professional executive standard.
                        </p>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={submitEveningReport}
                      className="w-full bg-red-500 hover:bg-red-400 text-slate-950 font-mono text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-red-500/10 transition-all uppercase tracking-wider mt-4"
                    >
                      <CheckCircle className="w-4 h-4 fill-current text-slate-950" /> Publish Report & Rollover
                    </button>
                  </div>
                </div>
              )}

              {powerPlanView === 'tomorrow' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Columns: Tomorrow's Planner */}
                  <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        <h3 className="text-base font-display font-bold text-slate-100 uppercase tracking-wide">
                          📋 TOMORROW'S PRE-PLANNING BLUEPRINT ({(() => {
                            const [y, m, d] = tomorrowDateStr.split('-').map(Number);
                            const locD = new Date(y, m - 1, d);
                            return locD.toLocaleDateString('en-US', { weekday: 'long' });
                          })()})
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400 font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                        Date: {tomorrowDateStr}
                      </span>
                    </div>

                    {/* Add action step form for tomorrow */}
                    <form onSubmit={(e) => { e.preventDefault(); addGoalLinkedPowerTask(getTomorrowDayObject().id, powerTaskCategory === 'CUSTOM', tomorrowDateStr); }} className="space-y-3 bg-slate-950/40 border border-slate-800 p-4 rounded-xl">
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Add Action to Tomorrow's Blueprint</div>
                      
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input 
                          type="text"
                          placeholder="Plan action step for tomorrow..."
                          value={powerTaskTitle}
                          onChange={(e) => setPowerTaskTitle(e.target.value)}
                          className="bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none flex-1 transition-all"
                        />
                        
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <input 
                              type="time"
                              value={powerTaskTime}
                              onChange={(e) => setPowerTaskTime(e.target.value)}
                              className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none border-none p-0 cursor-pointer"
                            />
                          </div>

                          <select 
                            value={powerTaskGoalId}
                            onChange={(e) => setPowerTaskGoalId(e.target.value)}
                            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none transition-all sm:max-w-[180px]"
                          >
                            <option value="">🔗 Link to Goal...</option>
                            {goals.map(g => (
                              <option key={g.id} value={g.id}>{g.title}</option>
                            ))}
                          </select>
                        </div>

                        <select 
                          value={powerTaskCategory}
                          onChange={(e) => setPowerTaskCategory(e.target.value)}
                          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none transition-all sm:max-w-[160px]"
                        >
                          <option value="WEALTH CREATION">Wealth Creation</option>
                          <option value="BECOME INCREDIBLY MUSCULAR">Physical Muscle</option>
                          <option value="BECOME INCREDIBLY INTELLIGENT">Intelligence Growth</option>
                          <option value="CRACK EXAMS">Exam Conquest</option>
                          <option value="CUSTOM">-- Custom Category --</option>
                        </select>
                      </div>

                      {powerTaskCategory === 'CUSTOM' && (
                        <input 
                          type="text"
                          placeholder="Type custom category name..."
                          value={powerCustomCategory}
                          onChange={(e) => setPowerCustomCategory(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none transition-all"
                        />
                      )}

                      <button 
                        type="submit"
                        className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-mono text-[10px] py-1.5 rounded-lg font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Append Tomorrow's Goal-Linked Task
                      </button>
                    </form>

                    {/* Tomorrow's List */}
                    <div className="space-y-4">
                      {tomorrowCategories.length === 0 || tomorrowCategories.every(c => c.tasks.length === 0) ? (
                        <div className="text-center py-8 text-slate-500 text-xs">
                          <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          No action steps defined for tomorrow. Plan ahead to eliminate tomorrow's decision fatigue.
                        </div>
                      ) : (
                        tomorrowCategories.map(category => (
                          <div key={category.id} className="border-l-2 border-amber-500/60 pl-3 py-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{category.name}</span>
                              <button 
                                type="button"
                                onClick={() => deletePowerCategory(getTomorrowDayObject().id, category.id, tomorrowDateStr)}
                                className="text-[9px] font-mono text-slate-600 hover:text-red-400 transition-all"
                              >
                                Delete Column
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              {category.tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between gap-3 bg-slate-950/20 p-2.5 rounded-lg border border-slate-900/60 group hover:border-slate-850 transition-all">
                                  <div className="flex items-center gap-2.5 flex-1 text-slate-450">
                                    <div className="w-4 h-4 rounded-md border border-slate-800 bg-slate-950 flex items-center justify-center" />
                                    <div className="flex-1 flex flex-col text-left">
                                      <span className="text-xs text-slate-300">
                                        {task.title}
                                      </span>
                                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        {task.time && (
                                          <span className="text-[9px] text-amber-400 font-mono flex items-center gap-0.5 bg-amber-500/10 px-1 py-0.5 rounded">
                                            <Clock className="w-2.5 h-2.5" /> {task.time}
                                          </span>
                                        )}
                                        {task.goalTitle && (
                                          <span className="text-[9px] text-cyan-400 font-mono flex items-center gap-0.5 bg-cyan-500/10 px-1 py-0.5 rounded">
                                            <Target className="w-2.5 h-2.5" /> {task.goalTitle}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <button 
                                    type="button"
                                    onClick={() => deletePowerTask(getTomorrowDayObject().id, category.id, task.id, tomorrowDateStr)}
                                    className="opacity-70 hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                                    title="Delete task"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Pre-Planning benefits */}
                  <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                        <h3 className="text-sm font-display font-bold text-slate-100 uppercase tracking-wider">
                          💡 ARCHITECT MODE
                        </h3>
                      </div>
                      
                      <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-3.5 text-xs text-slate-300 leading-relaxed">
                        <p>
                          Planning tomorrow's focus steps tonight prepares your brain to execute with immediate speed.
                        </p>
                        <p>
                          When you wake up, your executive agenda is already locked down. You can skip the distraction of planning and dive immediately into high-intensity execution blocks.
                        </p>
                        <p className="border-t border-slate-850 pt-3 text-[11px] text-amber-400 font-mono">
                          *This tomorrow-planner acts as the source blueprint for the evening report rollover.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 p-3.5 rounded-xl">
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">PRO-TIP</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Link every planned action to one of your Vision Goals. Unaligned tasks are visual noise.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {powerPlanView === 'full' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {powerSystem.days.map((day) => {
                    let total = 0; let done = 0;
                    day.categories.forEach(c => c.tasks.forEach(t => { total++; if (t.completed) done++; }));
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                    return (
                      <div key={day.id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between min-h-[440px] border border-slate-800/80 hover:border-slate-700/50 transition-all shadow-md">
                        <div className="space-y-4 flex-1 flex flex-col">
                          {/* Day Title bar */}
                          <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded bg-blue-500 animate-pulse" />
                              <h4 className="text-sm font-display font-bold text-slate-100 uppercase tracking-wide">{day.dayName}</h4>
                            </div>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              pct >= 50 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-950/80 text-slate-500 border border-slate-800'
                            }`}>
                              {pct}% done
                            </span>
                          </div>

                          {/* List of focus tasks & categories */}
                          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 flex-1 scrollbar-thin">
                            {day.categories.map(category => (
                              <div key={category.id} className="space-y-2 bg-slate-950/30 p-2.5 rounded-xl border border-slate-900/80 group/cat">
                                {/* Category Header */}
                                <div className="flex justify-between items-center">
                                  <input 
                                    type="text"
                                    value={category.name}
                                    onChange={(e) => updatePowerCategoryName(day.id, category.id, e.target.value)}
                                    className="text-[9px] font-mono text-slate-400 focus:text-cyan-400 font-bold uppercase tracking-widest bg-transparent border-b border-transparent focus:border-cyan-500/40 focus:outline-none py-0.5 px-1 max-w-[150px] transition-all"
                                    title="Edit category name"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => deletePowerCategory(day.id, category.id)}
                                    className="opacity-0 group-hover/cat:opacity-100 text-[8px] text-slate-600 hover:text-red-400 font-mono uppercase tracking-wide transition-all"
                                    title="Delete category"
                                  >
                                    Remove
                                  </button>
                                </div>

                                {/* Tasks under this category */}
                                <div className="space-y-1.5 pl-1">
                                  {category.tasks.map(t => (
                                    <div key={t.id} className="flex justify-between items-center gap-2 group/task bg-slate-950/20 px-2 py-1.5 rounded border border-slate-900/60 hover:border-slate-800/80 transition-all">
                                      <div className="flex items-center gap-2 flex-1">
                                        <button
                                          type="button"
                                          onClick={() => togglePowerTask(day.id, category.id, t.id)}
                                          className="focus:outline-none"
                                        >
                                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                            t.completed 
                                              ? 'bg-blue-500 border-blue-500 text-slate-950 shadow-sm' 
                                              : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                                          }`}>
                                            {t.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                          </div>
                                        </button>
                                        
                                        <div className="flex-1 flex flex-col text-left">
                                          <input 
                                            type="text"
                                            value={t.title}
                                            onChange={(e) => updatePowerTaskTitle(day.id, category.id, t.id, e.target.value)}
                                            className={`bg-transparent border-b border-transparent hover:border-slate-800 focus:border-blue-500/40 text-[11px] focus:outline-none transition-all w-full ${
                                              t.completed ? 'text-slate-500 line-through' : 'text-slate-300 focus:text-slate-100'
                                            }`}
                                          />
                                          {t.goalTitle && (
                                            <span className="text-[9px] text-cyan-400 font-mono flex items-center gap-0.5 mt-0.5">
                                              <Target className="w-2.5 h-2.5" /> {t.goalTitle}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <button
                                        type="button"
                                        onClick={() => deletePowerTask(day.id, category.id, t.id)}
                                        className="opacity-70 hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                                        title="Delete task"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}

                                  {/* Inline Add Task Input */}
                                  <input 
                                    type="text"
                                    placeholder="+ Add task to blueprint..."
                                    className="w-full bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all mt-1"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                        addPowerTask(day.id, category.id, e.currentTarget.value.trim());
                                        e.currentTarget.value = '';
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            ))}

                            {day.categories.length === 0 && (
                              <div className="text-center py-8 text-slate-600 text-xs font-mono">
                                No focus categories setup.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Add Category input */}
                        <div className="pt-3 border-t border-slate-800/80 mt-2">
                          <input 
                            type="text"
                            placeholder="+ Create New Category Column (Press Enter)..."
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-700 transition-all"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                addPowerCategory(day.id, e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })()}



        {/* Focus section (modular component, strictly after Performance Log) */}
        {activeSubTab === 'focus' && (
          <FocusExecutiveTimer
            timerMode={timerMode}
            resetTimerMode={resetTimerMode}
            isTimerRunning={isTimerRunning}
            setIsTimerRunning={setIsTimerRunning}
            selectedTaskForTimer={selectedTaskForTimer}
            isSoundOn={isSoundOn}
            setIsSoundOn={setIsSoundOn}
            setIsFocusOverlayActive={setIsFocusOverlayActive}
            progressPercent={progressPercent}
            secondsLeft={secondsLeft}
            formatTime={formatTime}
            customMinutes={customMinutes}
            setCustomMinutes={setCustomMinutes}
            setSecondsLeft={setSecondsLeft}
            setCustomDuration={setCustomDuration}
          />
        )}
      </AnimatePresence>

      {/* --- Distraction-Free Fullscreen Focus Mode Overlay --- */}
      {isFocusOverlayActive && (
        <div className="fixed inset-0 bg-[#04060f] z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full flex flex-col items-center justify-between h-5/6 relative">
            
            {/* Header controls */}
            <div className="w-full flex justify-between items-center text-xs font-mono text-slate-400">
              <span className="text-cyan-400 uppercase tracking-wider">FOCUS MODE STATE: ISOLATED</span>
              <button 
                onClick={() => setIsFocusOverlayActive(false)}
                className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 transition-all"
              >
                <Minimize2 className="w-3.5 h-3.5" /> Close Isolation
              </button>
            </div>

            {/* Glowing Big Timer */}
            <div className="flex flex-col items-center my-12">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">CONCENTRATED TIMER</div>
              <h1 className="text-7xl font-display font-bold font-mono tracking-tight text-cyan-400 select-none neon-glow-blue px-6 py-2 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
                {formatTime(secondsLeft)}
              </h1>
              
              <div className="mt-4 text-xs text-slate-400 font-mono max-w-sm">
                {selectedTaskForTimer ? (
                  <p className="text-slate-300">Executing: <span className="text-cyan-400 font-semibold">{selectedTaskForTimer.title}</span></p>
                ) : (
                  <p className="italic">Deep space focus. Clear your mind of all extraneous micro-tasks.</p>
                )}
              </div>
            </div>

            {/* Control buttons */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 justify-center">
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-10 py-3.5 rounded-full font-mono text-sm font-bold flex items-center gap-2 shadow-lg transition-all ${
                    isTimerRunning
                      ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:shadow-cyan-500/25'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current" />}
                  {isTimerRunning ? 'Pause Session' : 'Start Focus Session'}
                </button>
              </div>

              <div className="flex gap-2.5 justify-center bg-slate-900/40 p-1.5 rounded-xl border border-slate-800 max-w-xs mx-auto">
                <button 
                  onClick={() => resetTimerMode('focus', customMinutes)}
                  className={`px-3 py-1 rounded text-[10px] font-mono ${timerMode === 'focus' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Focus ({customMinutes}m)
                </button>
                <button 
                  onClick={() => resetTimerMode('short')}
                  className={`px-3 py-1 rounded text-[10px] font-mono ${timerMode === 'short' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Short (5m)
                </button>
                <button 
                  onClick={() => resetTimerMode('long')}
                  className={`px-3 py-1 rounded text-[10px] font-mono ${timerMode === 'long' ? 'bg-blue-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Long (15m)
                </button>
              </div>
            </div>

            {/* Small Footer Affirmation */}
            <div className="text-[10px] font-mono text-slate-500 mt-6 italic">
              "Focus is a matter of deciding what things you're not going to do."
            </div>
          </div>
        </div>
      )}

      {/* RECURRENCE CONFIGURATION MODAL */}
      {isRecurrenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 text-left">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Repeat className="w-5 h-5 stroke-[2]" />
                <h3 className="font-display font-bold text-slate-100 text-base uppercase tracking-wider">Configure Task Recurrence</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsRecurrenceModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-all p-1 hover:bg-slate-800/50 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Frequency Type Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Frequency Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setModalFreqType(type)}
                      className={`py-2 px-3 text-xs font-mono font-bold uppercase rounded-xl border transition-all cursor-pointer ${
                        modalFreqType === type
                          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400 shadow-sm font-bold'
                          : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Configuration */}
              {modalFreqType === 'weekly' && (
                <div className="space-y-2 bg-slate-950/30 p-3 rounded-xl border border-slate-850">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Select Active Days</label>
                  <div className="flex flex-wrap gap-1.5 justify-between">
                    {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => {
                      const isSelected = modalWeeklyDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setModalWeeklyDays(modalWeeklyDays.filter(d => d !== day));
                            } else {
                              setModalWeeklyDays([...modalWeeklyDays, day]);
                            }
                          }}
                          className={`w-9 h-9 text-xs font-mono font-bold rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-sm'
                              : 'bg-slate-900 border-slate-800/80 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          {day.substring(0, 1).toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Monthly Configuration */}
              {modalFreqType === 'monthly' && (
                <div className="space-y-3 bg-slate-950/30 p-3.5 rounded-xl border border-slate-850">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Monthly Strategy</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setModalMonthlyType('specific_date')}
                      className={`py-1.5 px-3 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                        modalMonthlyType === 'specific_date'
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      Specific Date
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalMonthlyType('relative_day')}
                      className={`py-1.5 px-3 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                        modalMonthlyType === 'relative_day'
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      Relative Day
                    </button>
                  </div>

                  {modalMonthlyType === 'specific_date' ? (
                    <div className="space-y-1.5 pt-1.5">
                      <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Day of the Month</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={modalMonthlySpecificDate}
                          onChange={(e) => setModalMonthlySpecificDate(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                          className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono text-center focus:outline-none focus:border-cyan-500"
                        />
                        <span className="text-xs text-slate-400 font-mono">day of every month (e.g. 1st, 15th)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 pt-1.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Occurrence</label>
                        <select
                          value={modalMonthlyRelativeWeek}
                          onChange={(e) => setModalMonthlyRelativeWeek(parseInt(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer animate-none"
                        >
                          <option value="1">1st</option>
                          <option value="2">2nd</option>
                          <option value="3">3rd</option>
                          <option value="4">4th</option>
                          <option value="-1">Last</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Weekday</label>
                        <select
                          value={modalMonthlyRelativeDay}
                          onChange={(e) => setModalMonthlyRelativeDay(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer animate-none"
                        >
                          <option value="mon">Monday</option>
                          <option value="tue">Tuesday</option>
                          <option value="wed">Wednesday</option>
                          <option value="thu">Thursday</option>
                          <option value="fri">Friday</option>
                          <option value="sat">Saturday</option>
                          <option value="sun">Sunday</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* End Conditions */}
              <div className="space-y-2.5 bg-slate-950/20 p-3.5 rounded-xl border border-slate-850">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">End Condition</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="radio"
                      name="endCondition"
                      checked={modalEndCondition === 'forever'}
                      onChange={() => setModalEndCondition('forever')}
                      className="accent-cyan-500"
                    />
                    Repeat Forever
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="radio"
                      name="endCondition"
                      checked={modalEndCondition === 'until_date'}
                      onChange={() => setModalEndCondition('until_date')}
                      className="accent-cyan-500"
                    />
                    Until Specific Date
                  </label>
                </div>

                {modalEndCondition === 'until_date' && (
                  <div className="pt-2">
                    <input
                      type="date"
                      value={modalUntilDate}
                      onChange={(e) => setModalUntilDate(e.target.value)}
                      className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-800/60 pt-4">
              <button
                type="button"
                onClick={() => {
                  setRecurrenceConfig(null);
                  setIsRecurrenceModalOpen(false);
                }}
                className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-mono text-xs rounded-xl transition-all cursor-pointer"
              >
                Disable Repeat
              </button>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRecurrenceModalOpen(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800/50 text-slate-400 font-mono text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const config: RecurrenceConfig = {
                      frequency: modalFreqType,
                      weeklyDays: modalFreqType === 'weekly' ? modalWeeklyDays : undefined,
                      monthlyType: modalFreqType === 'monthly' ? modalMonthlyType : undefined,
                      monthlySpecificDate: modalFreqType === 'monthly' && modalMonthlyType === 'specific_date' ? modalMonthlySpecificDate : undefined,
                      monthlyRelativeWeek: modalFreqType === 'monthly' && modalMonthlyType === 'relative_day' ? modalMonthlyRelativeWeek : undefined,
                      monthlyRelativeDay: modalFreqType === 'monthly' && modalMonthlyType === 'relative_day' ? modalMonthlyRelativeDay : undefined,
                      endCondition: modalEndCondition,
                      untilDate: modalEndCondition === 'until_date' ? modalUntilDate : undefined
                    };
                    setRecurrenceConfig(config);
                    setIsRecurrenceModalOpen(false);
                  }}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/15 cursor-pointer"
                >
                  Apply Recurrence
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
