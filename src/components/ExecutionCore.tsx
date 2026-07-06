import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Target, 
  Repeat, 
  Plus, 
  Check, 
  Trash2, 
  Flame, 
  CheckCircle,
  X,
  Sparkles,
  Tag,
  Flag,
  Paperclip,
  Bell,
  Archive,
  ChevronDown,
  ChevronUp,
  FileText,
  MousePointer,
  HelpCircle,
  Sliders,
  Volume2,
  VolumeX,
  PlusCircle,
  Users,
  Award,
  StickyNote
} from 'lucide-react';
import { Goal } from '../types';
import { RecurrenceConfig } from './ProductivityHub';

// Import our modular sub-components
import IOSWheelPicker, { IOSBottomSheetTimePicker } from './IOSWheelPicker';
import { parseNaturalLanguageTask } from './NLPParser';
import SmartFilters, { FilterType } from './SmartFilters';
import TimelineView from './TimelineView';
import OverdueBanner from './OverdueBanner';

interface ExecutionCoreProps {
  powerDate: string;
  setPowerDate: (date: string) => void;
  powerSystem: any;
  setPowerSystem: React.Dispatch<React.SetStateAction<any>>;
  goals: Goal[];
  addPowerCategory: (dayId: string, name: string, targetDateStr?: string) => void;
  deletePowerCategory: (dayId: string, categoryId: string, targetDateStr?: string) => void;
  addPowerTask: (dayId: string, categoryId: string, title: string, targetDateStr?: string, timeStr?: string, goalTitle?: string) => void;
  deletePowerTask: (dayId: string, categoryId: string, taskId: string, targetDateStr?: string, deleteAllSeries?: boolean) => void;
  togglePowerTask: (dayId: string, categoryId: string, taskId: string, targetDateStr?: string) => void;
  updatePowerTaskTitle: (dayId: string, categoryId: string, taskId: string, title: string, targetDateStr?: string) => void;
  importBlueprintToDate: (dateStr: string) => void;
  getCategoriesForDate: (dateStr: string) => any[];
  getTodayDayObject: () => any;
  getWeekdayIdFromDate: (dateStr: string) => string;
  eveningNotes: string;
  setEveningNotes: (notes: string) => void;
  submitEveningReport: () => void;
}

export default function ExecutionCore({
  powerDate,
  setPowerDate,
  powerSystem,
  setPowerSystem,
  goals,
  addPowerCategory,
  deletePowerCategory,
  addPowerTask,
  deletePowerTask,
  togglePowerTask,
  updatePowerTaskTitle,
  importBlueprintToDate,
  getCategoriesForDate,
  getTodayDayObject,
  getWeekdayIdFromDate,
  eveningNotes,
  setEveningNotes,
  submitEveningReport
}: ExecutionCoreProps) {

  // --- LOCAL STATES ---
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // --- ALARM STATE ---
  const [activeAlarmTask, setActiveAlarmTask] = useState<any | null>(null);
  const audioIntervalRef = useRef<any>(null);

  // --- NLP & QUICK ADD INPUTS ---
  const [rawInput, setRawInput] = useState('');
  const [taskCategory, setTaskCategory] = useState('CORE FOCUS');
  const [taskGoalId, setTaskGoalId] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('30m');
  const [priorityInput, setPriorityInput] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [taskTime, setTaskTime] = useState('09:00 AM');
  const [isTimePickerSheetOpen, setIsTimePickerSheetOpen] = useState(false);
  const [reminderType, setReminderType] = useState<'none' | 'notification' | 'alarm'>('none');

  // --- SUBTASKS STATE FOR CREATOR ---
  const [subtasksInput, setSubtasksInput] = useState<string[]>([]);
  const [subtaskText, setSubtaskText] = useState('');

  // --- ATTACHMENTS STATE ---
  const [attachmentsInput, setAttachmentsInput] = useState<Array<{ name: string; size: string; type: string }>>([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // --- RECURRENCE ---
  const [recurrenceConfig, setLocalRecurrenceConfig] = useState<RecurrenceConfig | null>(null);
  const [isRecurrenceOpen, setIsRecurrenceOpen] = useState(false);

  // --- PREMIUM NATIVE iOS TASK DETAIL SHEET & DELETE STATES ---
  const [selectedSheetTask, setSelectedSheetTask] = useState<any | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDuration, setEditDuration] = useState('30m');
  const [editReminder, setEditReminder] = useState<'none' | 'notification' | 'alarm'>('none');
  const [editRecurrence, setEditRecurrence] = useState<any | null>(null);
  const [editPriority, setEditPriority] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [editGoalId, setEditGoalId] = useState('');
  const [editNotes, setEditNotes] = useState('');



  const getTasksForDate = (dateStr: string) => {
    const categories = getCategoriesForDate(dateStr) || [];
    return categories.flatMap(cat => 
      (cat.tasks || []).map((t: any) => ({
        ...t,
        categoryId: cat.id,
        categoryName: cat.name,
        date: dateStr,
        dayId: getWeekdayIdFromDate(dateStr)
      }))
    );
  };

  const getHourForTask = (timeStr: string) => {
    if (!timeStr) return "Anytime";
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return "Anytime";
    let h = parseInt(match[1]);
    let ampm = match[3] ? match[3].toUpperCase() : '';
    
    if (!ampm) {
      if (h >= 12) {
        ampm = 'PM';
        if (h > 12) h -= 12;
      } else {
        ampm = 'AM';
        if (h === 0) h = 12;
      }
    }
    const paddedHour = h.toString().padStart(2, '0');
    return `${paddedHour}:00 ${ampm}`;
  };



  const handleCalendarAddTask = (dateStr: string, timeStr?: string) => {
    const dayId = getWeekdayIdFromDate(dateStr);
    const categories = getCategoriesForDate(dateStr);
    let categoryId = '';
    if (categories && categories.length > 0) {
      categoryId = categories[0].id;
    } else {
      const defaultCatName = "CORE FOCUS";
      addPowerCategory(dayId, defaultCatName, dateStr);
      const updatedCats = getCategoriesForDate(dateStr);
      const found = updatedCats.find(c => c.name.toUpperCase() === defaultCatName);
      categoryId = found ? found.id : `p-cat-${Date.now()}`;
    }
    
    setTaskTime(timeStr || '09:00 AM');
    setPowerDate(dateStr);
    setTaskCategory(categories && categories.length > 0 ? categories[0].name : "CORE FOCUS");
    setIsQuickAddOpen(true);
  };

  const hours = [
    "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
    "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"
  ];

  // Delete Task confirmation dialog state
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<{ dayId: string; categoryId: string; taskId: string; date: string; title: string; isRecurring: boolean } | null>(null);

  // Floating Action Button expanded menu state
  const [isFabOpen, setIsFabOpen] = useState(false);

  // --- NOTIFICATION PUSH SIMULATION ---
  const [activeNotification, setActiveNotification] = useState<{ id: string; title: string; time: string } | null>(null);
  const [hasSound, setHasSound] = useState(true);

  // --- WEB AUDIO API ALARM HANDLERS ---
  const startAlarmSound = () => {
    if (!hasSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioIntervalRef.current = setInterval(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, audioCtx.currentTime); // Beep frequency
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      }, 1000);
    } catch (e) {
      console.error(e);
    }
  };

  const stopAlarmSound = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
  };

  const snoozeAlarmTask = (minutes: number) => {
    if (!activeAlarmTask) return;
    stopAlarmSound();

    const currentMins = parseTimeToMinutes(activeAlarmTask.time);
    const snoozedMins = currentMins + minutes;
    const newTimeStr = formatMinutesToTimeStr(snoozedMins);
    const newEndTimeStr = formatMinutesToTimeStr(snoozedMins + (activeAlarmTask.duration || 60));

    handleUpdateTaskMultiDate(
      getWeekdayIdFromDate(activeAlarmTask.date),
      activeAlarmTask.categoryId,
      activeAlarmTask.id,
      {
        time: newTimeStr,
        endTime: newEndTimeStr,
        notified: false
      }
    );

    setActiveAlarmTask(null);
  };

  // --- ROBUST MULTI-DATE TASK UPDATER ---
  const handleUpdateTaskMultiDate = (
    dayId: string,
    categoryId: string,
    taskId: string,
    fields: Partial<any>
  ) => {
    setPowerSystem((prev: any) => {
      const dateTasks = { ...(prev.dateTasks || {}) };
      
      // 1. Find the task in any date
      let foundTask: any = null;
      let sourceDate = powerDate;
      
      for (const dStr of Object.keys(dateTasks)) {
        const cats = dateTasks[dStr] || [];
        for (const cat of cats) {
          const t = (cat.tasks || []).find((x: any) => x.id === taskId);
          if (t) {
            foundTask = t;
            sourceDate = dStr;
            break;
          }
        }
        if (foundTask) break;
      }

      if (!foundTask) {
        const dayObj = (prev.days || []).find((d: any) => d.id === dayId);
        if (dayObj) {
          for (const cat of (dayObj.categories || [])) {
            const t = (cat.tasks || []).find((x: any) => x.id === taskId);
            if (t) {
              foundTask = t;
              break;
            }
          }
        }
      }

      if (!foundTask) return prev;

      const updatedTask = { ...foundTask, ...fields };

      // 2. Remove task from original source date
      const sourceCats = dateTasks[sourceDate] || [];
      const cleanedSourceCats = sourceCats.map((cat: any) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          tasks: (cat.tasks || []).filter((x: any) => x.id !== taskId)
        };
      });
      dateTasks[sourceDate] = cleanedSourceCats;

      // 3. Add or update task in destination date
      const destDate = fields.date || sourceDate;
      const destCats = dateTasks[destDate] || [];
      const destCatName = updatedTask.categoryName || categoryId;
      
      let destCatExists = destCats.find((c: any) => c.id === categoryId || c.name.toUpperCase() === destCatName.toUpperCase());
      
      let updatedDestCats;
      if (destCatExists) {
        updatedDestCats = destCats.map((c: any) => {
          if (c.id !== destCatExists.id) return c;
          return {
            ...c,
            tasks: [...(c.tasks || []).filter((x: any) => x.id !== taskId), updatedTask]
          };
        });
      } else {
        updatedDestCats = [
          ...destCats,
          {
            id: categoryId || `cat-${Date.now()}`,
            name: destCatName,
            isOpen: true,
            tasks: [updatedTask]
          }
        ];
      }
      dateTasks[destDate] = updatedDestCats;

      return {
        ...prev,
        dateTasks
      };
    });
  };

  // --- NLP Parsing Feedback ---
  const parsedNLP = parseNaturalLanguageTask(rawInput, powerDate);

  // Time conversion helpers
  const parseTimeToMinutes = (tStr: string): number => {
    if (!tStr) return 540; // 9:00 AM default
    const clean = tStr.trim().toUpperCase();
    const parts = clean.split(':');
    let hrs = parseInt(parts[0]) || 0;
    const minsPart = parts[1] || '00';
    const mins = parseInt(minsPart.replace(/[^\d]/g, '')) || 0;
    const isPM = clean.includes('PM');
    if (isPM && hrs < 12) hrs += 12;
    if (!isPM && hrs === 12) hrs = 0;
    return hrs * 60 + mins;
  };

  const formatMinutesToTimeStr = (totalMins: number): string => {
    const hours24 = Math.floor((totalMins % 1440) / 60);
    const mins = Math.floor(totalMins % 60);
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const displayHr = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${String(displayHr).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
  };

  // Trigger simulated reminder notifications & alarms
  useEffect(() => {
    const interval = setInterval(() => {
      // Check if any of today's tasks matches current minute
      const now = new Date();
      const currentHrs = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const current24Str = `${currentHrs}:${currentMins}`;

      // Convert 12h AM/PM formatted task time to 24h
      const convertTo24 = (t12: string) => {
        if (!t12) return '';
        if (!t12.includes('AM') && !t12.includes('PM')) return t12;
        const parts = t12.split(':');
        let hr = parseInt(parts[0]) || 0;
        const mins = parts[1] ? parts[1].replace(/[^\d]/g, '') : '00';
        const isPM = t12.toLowerCase().includes('pm');
        if (isPM && hr < 12) hr += 12;
        if (!isPM && hr === 12) hr = 0;
        return `${String(hr).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      };

      const todayCats = getCategoriesForDate(powerDate);
      todayCats.forEach(cat => {
        cat.tasks.forEach((t: any) => {
          if (t.time && !t.completed && !t.notified) {
            const task24 = convertTo24(t.time);
            if (task24 === current24Str) {
              // Mark notified
              t.notified = true;

              if (t.reminderType === 'alarm') {
                // Trigger full-screen executive alarm
                setActiveAlarmTask({
                  ...t,
                  categoryId: cat.id,
                  categoryName: cat.name,
                  date: powerDate
                });
                startAlarmSound();
              } else {
                // Trigger standard top banner notification
                setActiveNotification({
                  id: t.id,
                  title: t.title,
                  time: t.time
                });

                // Play gentle bell sound if audio is enabled
                if (hasSound) {
                  try {
                    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
                    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.35);
                  } catch (e) {}
                }

                // Self-dismiss after 8 seconds
                setTimeout(() => {
                  setActiveNotification(null);
                }, 8000);
              }
            }
          }
        });
      });
    }, 15000); // Check every 15s

    return () => {
      clearInterval(interval);
      stopAlarmSound();
    };
  }, [powerDate, hasSound]);

  // Request browser Notification permission (Fallback inside iframe safely)
  const requestNotificationPermission = () => {
    if (typeof Notification !== 'undefined') {
      try {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('AETHER.OS', {
              body: 'Push Notification Alerts Activated Successfully.',
              icon: '/favicon.ico'
            });
          }
        });
      } catch (err) {
        // Fallback for iframe policy
        console.log('Notification permission request bypassed or blocked by iframe security.');
      }
    }
  };

  // --- DATA COMPUTATIONS ---
  const todayCategories = getCategoriesForDate(powerDate);

  // Sanitize task lists with HIG fallbacks
  const sanitizeTask = (t: any) => ({
    id: t.id,
    title: t.title,
    completed: t.completed,
    time: t.time || undefined,
    goalTitle: t.goalTitle || undefined,
    recurrence: t.recurrence || undefined,
    seriesId: t.seriesId || undefined,
    priority: t.priority || 'none',
    tags: t.tags || [],
    notes: t.notes || '',
    subtasks: t.subtasks || [],
    estimatedDuration: t.estimatedDuration || '30m',
    attachments: t.attachments || [],
    reminderLeadTime: t.reminderLeadTime !== undefined ? t.reminderLeadTime : 15,
    archived: t.archived || false
  });

  // Collect all active and history tasks
  const getAllTasksFromLedger = (): any[] => {
    const all: any[] = [];
    const dateTasks = powerSystem.dateTasks || {};
    
    // Gather from explicit dates
    Object.keys(dateTasks).forEach(dStr => {
      const cats = dateTasks[dStr] || [];
      cats.forEach((cat: any) => {
        (cat.tasks || []).forEach((t: any) => {
          all.push({
            ...sanitizeTask(t),
            dateStr: dStr,
            date: dStr,
            categoryName: cat.name,
            categoryId: cat.id
          });
        });
      });
    });

    // Gather from weekly template days
    const weekDays = powerSystem.days || [];
    weekDays.forEach((day: any) => {
      (day.categories || []).forEach((cat: any) => {
        (cat.tasks || []).forEach((t: any) => {
          // Do not double count templates unless no dates exist
        });
      });
    });

    return all;
  };

  const allLedgerTasks = getAllTasksFromLedger();

  // Audit overdue tasks (prior dates, uncompleted, not archived)
  const getOverdueTasks = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return allLedgerTasks.filter(t => t.dateStr < todayStr && !t.completed && !t.archived);
  };

  const overdueTasksList = getOverdueTasks();

  // Handle single reschedule
  const handleRescheduleSingle = (taskId: string, originalDateStr: string, categoryId: string) => {
    setPowerSystem((prev: any) => {
      const dateTasks = { ...(prev.dateTasks || {}) };
      
      // Find and remove task from original date
      let foundTask: any = null;
      if (dateTasks[originalDateStr]) {
        dateTasks[originalDateStr] = dateTasks[originalDateStr].map((cat: any) => {
          if (cat.id !== categoryId) return cat;
          const filtered = (cat.tasks || []).filter((t: any) => {
            if (t.id === taskId) {
              foundTask = { ...t, date: powerDate };
              return false;
            }
            return true;
          });
          return { ...cat, tasks: filtered };
        });
      }

      if (!foundTask) return prev;

      // Append task to powerDate inside original category or default
      const currentCats = getCategoriesForDate(powerDate);
      const targetCatName = foundTask.categoryName || 'CORE FOCUS';
      let existingCat = currentCats.find((c: any) => c.name.toUpperCase() === targetCatName.toUpperCase());

      let updatedCats;
      if (existingCat) {
        updatedCats = currentCats.map((c: any) => {
          if (c.id !== existingCat.id) return c;
          return { ...c, tasks: [...c.tasks, foundTask] };
        });
      } else {
        updatedCats = [
          ...currentCats,
          {
            id: `p-cat-${Date.now()}`,
            name: targetCatName,
            isOpen: true,
            tasks: [foundTask]
          }
        ];
      }

      return {
        ...prev,
        dateTasks: {
          ...dateTasks,
          [powerDate]: updatedCats
        }
      };
    });
  };

  // Handle reschedule all
  const handleRescheduleAll = () => {
    overdueTasksList.forEach(t => {
      handleRescheduleSingle(t.id, t.dateStr, t.categoryId);
    });
  };

  // Compute smart filter counts
  const todayStr = new Date().toISOString().split('T')[0];
  const filterCounts: Record<FilterType, number> = {
    all: allLedgerTasks.filter(t => !t.archived).length,
    today: allLedgerTasks.filter(t => t.dateStr === powerDate && !t.archived).length,
    scheduled: allLedgerTasks.filter(t => t.time && !t.archived).length,
    flagged: allLedgerTasks.filter(t => t.priority === 'high' && !t.archived).length,
    overdue: overdueTasksList.length,
    completed: allLedgerTasks.filter(t => t.completed && !t.archived).length
  };

  // Filter tasks currently shown in active area
  const getFilteredActiveTasks = () => {
    const list = todayCategories.flatMap(cat => 
      (cat.tasks || []).map((t: any) => ({
        ...sanitizeTask(t),
        categoryName: cat.name,
        categoryId: cat.id
      }))
    );

    switch (activeFilter) {
      case 'today':
        return list.filter(t => !t.archived);
      case 'scheduled':
        return list.filter(t => t.time && !t.archived);
      case 'flagged':
        return list.filter(t => t.priority === 'high' && !t.archived);
      case 'completed':
        return list.filter(t => t.completed && !t.archived);
      case 'overdue':
        // Overdue are already isolated, but if they click Overdue card we show overdue list for the day or historically
        return overdueTasksList;
      case 'all':
      default:
        return list.filter(t => !t.archived);
    }
  };

  const handleLetAIPlanMyDay = () => {
    const dayId = getWeekdayIdFromDate(powerDate);
    const currentCats = getCategoriesForDate(powerDate);
    
    const workCat = currentCats.find(c => c.name.includes('WEALTH') || c.name.includes('CORE') || c.name.includes('WORK')) || currentCats[0];
    const healthCat = currentCats.find(c => c.name.includes('MUSCUL') || c.name.includes('HEALTH') || c.name.includes('GYM')) || currentCats[0];

    // Add high performance blocks
    addPowerTask(dayId, workCat?.id || 'uncategorized', "🧠 AI Planned: Strategic Deep Work Session", powerDate, "02:00 PM", goals[0]?.title);
    addPowerTask(dayId, healthCat?.id || 'uncategorized', "🏋️ AI Planned: Gym High-Intensity Training", powerDate, "05:30 PM", goals[1]?.title);
    
    setActiveNotification({
      id: Math.random().toString(),
      title: "✨ AI Daily Blueprint Generated",
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
    
    startAlarmSound();
    setTimeout(stopAlarmSound, 500);
  };

  // Open bottom sheet details edit panel
  const handleOpenDetailsSheet = (task: any) => {
    setSelectedSheetTask(task);
    setEditTitle(task.title || '');
    setEditTime(task.time || '');
    setEditDuration(task.estimatedDuration || (task.duration ? (task.duration >= 60 ? `${task.duration / 60}h` : `${task.duration}m`) : '30m'));
    setEditReminder(task.reminderType || 'none');
    setEditRecurrence(task.recurrence || null);
    setEditPriority(task.priority || 'none');
    // Look up the goal id for goalTitle
    const matchedGoal = goals.find(g => g.title === task.goalTitle);
    setEditGoalId(matchedGoal ? matchedGoal.id : '');
    setEditNotes(task.notes || '');
    setIsDetailSheetOpen(true);
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

  // Save changes from details sheet
  const handleSaveDetailsSheet = () => {
    if (!selectedSheetTask) return;
    
    const durationMins = (() => {
      const clean = editDuration.toLowerCase().trim();
      if (clean.includes('h')) {
        const hVal = parseFloat(clean.replace(/[^\d.]/g, '')) || 1;
        return hVal * 60;
      }
      return parseFloat(clean.replace(/[^\d.]/g, '')) || 30;
    })();

    const startMins = parseTimeToMinutes(editTime);
    const endMins = startMins + durationMins;
    const computedEndTime = formatMinutesToTimeStr(endMins);

    const matchedGoal = goals.find(g => g.id === editGoalId);
    const goalTitle = matchedGoal ? matchedGoal.title : undefined;

    setPowerSystem((prev: any) => {
      const dateTasks = { ...(prev.dateTasks || {}) };
      const seriesId = selectedSheetTask.seriesId || (editRecurrence ? `series-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` : undefined);
      
      const updatedTaskObj = {
        ...selectedSheetTask,
        title: editTitle,
        time: editTime || undefined,
        endTime: computedEndTime,
        duration: durationMins,
        reminderType: editReminder,
        recurrence: editRecurrence || undefined,
        priority: editPriority,
        goalTitle,
        notes: editNotes,
        estimatedDuration: editDuration,
        seriesId
      };

      if (seriesId) {
        Object.keys(dateTasks).forEach(dStr => {
          if (dStr >= selectedSheetTask.date) {
            const categories = dateTasks[dStr] || [];
            dateTasks[dStr] = categories.map((cat: any) => ({
              ...cat,
              tasks: (cat.tasks || []).map((t: any) => {
                if (t.seriesId !== seriesId && t.id !== selectedSheetTask.id) return t;
                return {
                  ...t,
                  title: editTitle,
                  time: editTime || undefined,
                  endTime: computedEndTime,
                  duration: durationMins,
                  reminderType: editReminder,
                  recurrence: editRecurrence || undefined,
                  priority: editPriority,
                  goalTitle,
                  notes: editNotes,
                  estimatedDuration: editDuration,
                  seriesId
                };
              })
            }));
          }
        });

        if (editRecurrence) {
          const targetCat = selectedSheetTask.categoryName || 'CUSTOM AGENDA';
          const finalDateTasks = replicateRecurringTask(dateTasks, updatedTaskObj, selectedSheetTask.date, targetCat);
          return {
            ...prev,
            dateTasks: finalDateTasks
          };
        }
      } else {
        const categories = dateTasks[selectedSheetTask.date] || [];
        dateTasks[selectedSheetTask.date] = categories.map((cat: any) => {
          if (cat.id !== selectedSheetTask.categoryId) return cat;
          return {
            ...cat,
            tasks: (cat.tasks || []).map((t: any) => {
              if (t.id !== selectedSheetTask.id) return t;
              return updatedTaskObj;
            })
          };
        });
      }

      return {
        ...prev,
        dateTasks
      };
    });

    setIsDetailSheetOpen(false);
    setSelectedSheetTask(null);
  };

  const filteredTasks = getFilteredActiveTasks();

  // Calculate completion percentage with micro progress ring
  let totalTasks = 0;
  let completedTasks = 0;
  todayCategories.forEach(cat => {
    (cat.tasks || []).forEach((t: any) => {
      totalTasks++;
      if (t.completed) completedTasks++;
    });
  });
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // --- ACTIONS & MUTATIONS ---
  const handleAddTaskSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Parse title, time, priority, tags via NLP
    const titleToUse = parsedNLP.title || rawInput.trim();
    if (!titleToUse) return;

    const finalPriority = parsedNLP.priority !== 'none' ? parsedNLP.priority : priorityInput;
    const finalTags = [...customTags, ...parsedNLP.tags];
    const finalTime = parsedNLP.timeStr 
      ? (() => {
          const [hStr, mStr] = parsedNLP.timeStr.split(':');
          const hr = parseInt(hStr);
          const period = hr >= 12 ? 'PM' : 'AM';
          const displayHr = hr % 12 === 0 ? 12 : hr % 12;
          return `${String(displayHr).padStart(2, '0')}:${mStr} ${period}`;
        })()
      : taskTime;

    const durationMins = (() => {
      const clean = estimatedDuration.toLowerCase().trim();
      if (clean.includes('h')) {
        const hVal = parseFloat(clean.replace(/[^\d.]/g, '')) || 1;
        return hVal * 60;
      }
      return parseFloat(clean.replace(/[^\d.]/g, '')) || 30;
    })();

    const startMins = parseTimeToMinutes(finalTime);
    const endMins = startMins + durationMins;
    const finalEndTime = formatMinutesToTimeStr(endMins);

    const isCustomCat = taskCategory === 'CUSTOM';
    const linkedGoal = goals.find(g => g.id === taskGoalId);
    const goalTitle = linkedGoal ? linkedGoal.title : undefined;

    const seriesId = recurrenceConfig ? `series-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` : undefined;
    const newTaskObj = {
      id: `p-task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: titleToUse,
      completed: false,
      goalTitle,
      time: finalTime || undefined,
      endTime: finalEndTime,
      duration: durationMins,
      reminderType: reminderType,
      recurrence: recurrenceConfig || undefined,
      priority: finalPriority,
      tags: finalTags,
      notes: '',
      subtasks: subtasksInput.map((st, i) => ({ id: `st-${Date.now()}-${i}`, title: st, completed: false })),
      estimatedDuration,
      attachments: attachmentsInput,
      reminderLeadTime: 15,
      archived: false,
      seriesId
    };

    setPowerSystem((prev: any) => {
      const dateTasks = prev.dateTasks || {};
      const categories = getCategoriesForDate(powerDate);
      
      const targetCat = isCustomCat ? 'CUSTOM AGENDA' : taskCategory;
      const existingCat = categories.find(c => c.name.toUpperCase() === targetCat.toUpperCase());
      
      let updatedCategories;
      if (existingCat) {
        updatedCategories = categories.map(c => {
          if (c.name.toUpperCase() !== targetCat.toUpperCase()) return c;
          return {
            ...c,
            isOpen: true,
            tasks: [...(c.tasks || []), newTaskObj]
          };
        });
      } else {
        updatedCategories = [
          ...categories,
          {
            id: `p-cat-${Date.now()}`,
            name: targetCat,
            isOpen: true,
            tasks: [newTaskObj]
          }
        ];
      }

      let newDateTasks = {
        ...dateTasks,
        [powerDate]: updatedCategories
      };

      if (newTaskObj.recurrence) {
        newDateTasks = replicateRecurringTask(newDateTasks, newTaskObj, powerDate, targetCat);
      }

      return {
        ...prev,
        dateTasks: newDateTasks
      };
    });

    // Reset fields
    setRawInput('');
    setCustomTags([]);
    setSubtasksInput([]);
    setAttachmentsInput([]);
    setLocalRecurrenceConfig(null);
    setIsQuickAddOpen(false);

    // Vibrate haptic fallback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([40, 20, 40]); } catch(err) {}
    }
  };

  // Add AI Suggested task
  const handleAddSuggestedTask = (title: string, category: string, goalTitle?: string) => {
    const newTaskObj = {
      id: `p-task-${Date.now()}`,
      title,
      completed: false,
      goalTitle,
      time: '10:00 AM',
      priority: 'medium',
      tags: ['ai-suggested'],
      subtasks: [],
      notes: 'Generated automatically by AETHER AI based on your uncompleted goal structures.',
      estimatedDuration: '45m',
      attachments: [],
      archived: false
    };

    setPowerSystem((prev: any) => {
      const dateTasks = prev.dateTasks || {};
      const categories = getCategoriesForDate(powerDate);
      const existingCat = categories.find(c => c.name.toUpperCase() === category.toUpperCase());
      
      let updatedCategories;
      if (existingCat) {
        updatedCategories = categories.map(c => {
          if (c.name.toUpperCase() !== category.toUpperCase()) return c;
          return { ...c, tasks: [...(c.tasks || []), newTaskObj] };
        });
      } else {
        updatedCategories = [
          ...categories,
          {
            id: `p-cat-${Date.now()}`,
            name: category,
            isOpen: true,
            tasks: [newTaskObj]
          }
        ];
      }

      return {
        ...prev,
        dateTasks: { ...dateTasks, [powerDate]: updatedCategories }
      };
    });
  };

  // Expandable fields editing helper
  const updateTaskField = (categoryId: string, taskId: string, field: string, value: any) => {
    setPowerSystem((prev: any) => {
      const dateTasks = prev.dateTasks || {};
      const categories = getCategoriesForDate(powerDate);

      let targetTask: any = null;
      let targetCatName = '';

      // 1. Update the local task
      const updatedCategories = categories.map(cat => {
        if (cat.id !== categoryId) return cat;
        targetCatName = cat.name;
        return {
          ...cat,
          tasks: (cat.tasks || []).map((t: any) => {
            if (t.id !== taskId) return t;
            targetTask = { ...t, [field]: value };
            return targetTask;
          })
        };
      });

      let nextDateTasks = {
        ...dateTasks,
        [powerDate]: updatedCategories
      };

      if (targetTask) {
        // If they edited the recurrence config
        if (field === 'recurrence') {
          if (value) {
            // Changed from non-recurring to recurring
            const seriesId = targetTask.seriesId || `series-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
            targetTask.seriesId = seriesId;
            
            // Re-apply to the local copy in updatedCategories
            const finalCategories = updatedCategories.map(cat => {
              if (cat.id !== categoryId) return cat;
              return {
                ...cat,
                tasks: cat.tasks.map((t: any) => t.id === taskId ? targetTask : t)
              };
            });
            nextDateTasks[powerDate] = finalCategories;

            // Replicate across future days
            nextDateTasks = replicateRecurringTask(nextDateTasks, targetTask, powerDate, targetCatName);
          } else {
            // Removed recurrence: delete future occurrences of this seriesId
            const sId = targetTask.seriesId;
            if (sId) {
              Object.keys(nextDateTasks).forEach(dStr => {
                if (dStr > powerDate) {
                  const dayCats = nextDateTasks[dStr] || [];
                  nextDateTasks[dStr] = dayCats.map((cat: any) => ({
                    ...cat,
                    tasks: cat.tasks.filter((t: any) => t.seriesId !== sId)
                  })).filter((cat: any) => cat.tasks.length > 0);
                }
              });
              
              // Also remove seriesId from this task so it's a standalone task now
              targetTask.seriesId = undefined;
              const finalCategories = updatedCategories.map(cat => {
                if (cat.id !== categoryId) return cat;
                return {
                  ...cat,
                  tasks: cat.tasks.map((t: any) => t.id === taskId ? targetTask : t)
                };
              });
              nextDateTasks[powerDate] = finalCategories;
            }
          }
        } else {
          // If they updated any other field of a recurring task, propagate the change to all future items in the series
          const sId = targetTask.seriesId;
          if (sId) {
            Object.keys(nextDateTasks).forEach(dStr => {
              if (dStr > powerDate) {
                const dayCats = nextDateTasks[dStr] || [];
                nextDateTasks[dStr] = dayCats.map((cat: any) => ({
                  ...cat,
                  tasks: cat.tasks.map((t: any) => {
                    if (t.seriesId === sId) {
                      return { ...t, [field]: value };
                    }
                    return t;
                  })
                }));
              }
            });
          }
        }
      }

      return {
        ...prev,
        dateTasks: nextDateTasks
      };
    });
  };

  // Drag & drop simulated files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    
    // Simulate drop attachment meta
    const droppedFiles = Array.from(e.dataTransfer.files);
    const newAttachments = droppedFiles.map((f: any) => ({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      type: f.type || 'document/octet-stream'
    }));
    setAttachmentsInput(prev => [...prev, ...newAttachments]);
  };

  // Simulate file click upload
  const triggerSimulatedUpload = () => {
    const randomFiles = [
      { name: 'Blueprint_Spec_v3.pdf', size: '1.45 MB', type: 'application/pdf' },
      { name: 'Muscular_Routine_Macros.xlsx', size: '0.82 MB', type: 'application/vnd.ms-excel' },
      { name: 'SaaS_Database_Schema.png', size: '2.10 MB', type: 'image/png' }
    ];
    const picked = randomFiles[Math.floor(Math.random() * randomFiles.length)];
    setAttachmentsInput(prev => [...prev, picked]);
  };

  return (
    <div className="space-y-8 relative" id="ios-high-fidelity-productivity-engine">
      
      {/* --- FLOATING iOS BANNER NOTIFICATION (MOCK) --- */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ opacity: 0, y: -80, scale: 0.9 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9 }}
            transition={{ type: 'spring', damping: 15, stiffness: 120 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 w-[340px] z-50 glass-panel backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-3xl shadow-2xl flex gap-3.5 items-start text-left select-none cursor-pointer"
            onClick={() => setActiveNotification(null)}
          >
            <div className="w-9 h-9 rounded-full bg-cyan-500/10 dark:bg-red-500/10 flex items-center justify-center text-cyan-500 dark:text-red-400 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 dark:text-red-400">AETHER.OS ALERTS</span>
                <span className="text-[9px] font-mono text-slate-600 dark:text-slate-400">{activeNotification.time}</span>
              </div>
              <h5 className="text-xs font-sans font-semibold text-slate-800 dark:text-slate-100 mt-1">{activeNotification.title}</h5>
              <p className="text-[9.5px] text-slate-600 dark:text-slate-400 dark:text-slate-500 mt-0.5">High-leverage milestone execution is due now.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Smart Filter Cards at the Top */}
      <SmartFilters 
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter} 
        counts={filterCounts} 
      />

      {/* --- PREMIUM NATIVE iOS DAILY DASHBOARD (BENTO-GRID) --- */}
      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm text-left grid grid-cols-1 md:grid-cols-6 gap-6 items-center">
        {/* Today's Focus & Ring Progress */}
        <div className="md:col-span-2 flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/85 pb-4 md:pb-0 md:pr-6">
          {/* Animated Progress Ring */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="50%" cy="50%" r="26" stroke="#f1f5f9" strokeWidth="5" fill="transparent" className="dark:stroke-slate-800/60" />
              <circle
                cx="50%"
                cy="50%"
                r="26"
                stroke="url(#dashboardGrad)"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - completionPercent / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="dashboardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-xs font-mono font-bold text-slate-800 dark:text-slate-150">
              {completionPercent}%
            </span>
          </div>

          {/* Text Focus Details */}
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 dark:text-slate-500 tracking-wider">
              Today's Focus
            </span>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {allLedgerTasks.filter(t => t.dateStr === powerDate && t.priority === 'high' && !t.completed)[0]?.title || "Dominate Your Blueprint"}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-500">
              High-productivity execution window
            </p>
          </div>
        </div>

        {/* Completed and Focus hours */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/85 pb-4 md:pb-0 md:px-6">
          <div>
            <span className="text-[9px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 dark:text-slate-500 tracking-wider">
              Objectives Done
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">
                {completedTasks}
              </span>
              <span className="text-xs text-slate-450 font-mono">
                /{totalTasks}
              </span>
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-500 dark:text-slate-500 mt-0.5">
              {totalTasks - completedTasks} remaining blocks
            </p>
          </div>

          <div>
            <span className="text-[9px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 dark:text-slate-500 tracking-wider">
              Focus hours
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-display text-slate-850 dark:text-slate-100">
                {(() => {
                  const totalMins = allLedgerTasks
                    .filter(t => t.date === powerDate && t.completed)
                    .reduce((sum, t) => sum + (t.duration || 30), 0);
                  return (totalMins / 60).toFixed(1);
                })()}
              </span>
              <span className="text-xs text-slate-450 font-mono">
                hrs
              </span>
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-500 dark:text-slate-500 mt-0.5">
              Based on active durations
            </p>
          </div>
        </div>

        {/* Active Streak */}
        <div className="md:col-span-2 flex items-center justify-between md:pl-6">
          <div>
            <span className="text-[9px] font-mono font-bold uppercase text-slate-600 dark:text-slate-400 dark:text-slate-500 tracking-wider">
              AETHER STREAK
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Flame className="w-4 h-4 animate-pulse fill-orange-500" />
              </div>
              <span className="text-sm font-bold font-display text-orange-600 dark:text-orange-400">
                5 Days Active
              </span>
            </div>
            <p className="text-[9px] text-slate-550 dark:text-slate-500 mt-0.5">
              Keep momentum high!
            </p>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID FOR EXECUTION CORE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: HIGH-PERFORMANCE SCHEDULER (col-span-7) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* Timeline Scheduler Block */}
          <TimelineView 
            tasks={allLedgerTasks}
            activeDateStr={powerDate}
            setActiveDate={setPowerDate}
            goals={goals}
            onUpdateTask={handleUpdateTaskMultiDate}
            onDeleteTask={(dayId, categoryId, taskId) => deletePowerTask(dayId, categoryId, taskId, powerDate)}
            onToggleTask={(dayId, categoryId, taskId) => togglePowerTask(dayId, categoryId, taskId, powerDate)}
            onSlotClick={(timeStr, dateStr) => {
              setTaskTime(timeStr);
              setPowerDate(dateStr);
              setIsQuickAddOpen(true);
            }}
            getWeekdayIdFromDate={getWeekdayIdFromDate}
            onTaskClick={handleOpenDetailsSheet}
            onLetAIPlan={handleLetAIPlanMyDay}
            onImportCalendar={() => importBlueprintToDate(powerDate)}
          />

        </div>

        {/* RIGHT COLUMN: ACTIVE BLUEPRINT AGENDA (col-span-5) */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Overdue list Banner */}
          <OverdueBanner 
            overdueTasks={overdueTasksList}
            onReschedule={handleRescheduleSingle}
            onRescheduleAll={handleRescheduleAll}
          />

          {/* Active Date Header and Animated Daily Progress Ring */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-5 gap-4">
            <div className="space-y-1.5 text-left">
              <span className="px-2 py-0.5 rounded bg-[#f43f5e]/10 text-[#f43f5e] font-mono text-[9px] tracking-widest font-bold uppercase">
                ACTIVE BLUEPRINT AGENDA
              </span>
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {(() => {
                  const [y, m, d] = powerDate.split('-').map(Number);
                  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
                })()}
              </h2>
            </div>

            {/* Apple Activity Ring */}
            <div className="flex items-center gap-3.5 bg-white/70 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
              <div className="text-right">
                <span className="text-[9px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase block font-bold">Ring Status</span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {completedTasks}/{totalTasks} DONE ({completionPercent}%)
                </span>
              </div>
              
              <div className="relative w-10 h-10">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="16" stroke="rgba(244, 63, 94, 0.1)" strokeWidth="3.5" fill="transparent" />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="16"
                    stroke="#f43f5e"
                    strokeWidth="3.5"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 16}`}
                    strokeDashoffset={`${2 * Math.PI * 16 * (1 - completionPercent / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-[#f43f5e]">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Active Tasks list rendering */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16 text-slate-500 dark:text-slate-500 dark:text-slate-500 space-y-4 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-3xl bg-white/30 dark:bg-slate-950/10">
                <Flame className="w-10 h-10 text-slate-350 dark:text-slate-700 mx-auto animate-pulse" />
                <div className="space-y-1">
                  <p className="text-slate-700 dark:text-slate-300 font-semibold text-xs">No active agenda blocks matching active filters.</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Open the slide sheet or trigger AI recommendations to generate.</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono text-[10px] rounded-xl font-bold transition-all uppercase tracking-wider cursor-pointer shadow-md shadow-cyan-500/10"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Initialize Creator Sheet
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredTasks.map((task: any) => {
                    const isExpanded = expandedTaskId === task.id;
                    
                    // Priority border colors
                    const priorityBorders = 
                      task.priority === 'high' ? 'border-l-4 border-l-red-500 border-y border-r' :
                      task.priority === 'medium' ? 'border-l-4 border-l-orange-500 border-y border-r' :
                      task.priority === 'low' ? 'border-l-4 border-l-blue-500 border-y border-r' :
                      'border';

                    // Swipe Simulation Action triggers
                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                        className={`group relative bg-white/80 dark:bg-slate-950/20 backdrop-blur-md rounded-2xl p-4 transition-all shadow-sm flex flex-col justify-between border-slate-200/50 dark:border-slate-800/80 ${priorityBorders}`}
                      >
                        
                        {/* Task Card Core Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Tap-to-complete */}
                            <button
                              type="button"
                              onClick={() => togglePowerTask(getWeekdayIdFromDate(powerDate), task.categoryId, task.id, powerDate)}
                              className="cursor-pointer shrink-0"
                            >
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                task.completed
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/15'
                                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-500'
                              }`}>
                                {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </button>

                            <div className="flex-1 min-w-0">
                              <span className="text-[8px] font-mono uppercase bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-500 dark:text-slate-500 px-1.5 py-0.5 rounded font-bold mr-1.5">
                                {task.categoryName}
                              </span>
                              <h4 className={`text-xs font-semibold leading-relaxed break-words ${
                                task.completed ? 'text-slate-600 dark:text-slate-400 dark:text-slate-500 line-through' : 'text-slate-855 dark:text-slate-100'
                              }`}>
                                {task.title}
                              </h4>
                            </div>
                          </div>

                          {/* Controls (Expand details, delete) */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350 transition-all cursor-pointer"
                              title="Toggle Details Drawer"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => deletePowerTask(getWeekdayIdFromDate(powerDate), task.categoryId, task.id, powerDate)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-all cursor-pointer opacity-70 hover:opacity-100"
                              title="Delete Objective"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Expandable detailed drawer panel */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-900/60 space-y-4 text-xs animate-fadeIn">
                            
                            {/* Task Info & Timing Settings */}
                            <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 p-3.5 rounded-2xl space-y-3">
                              <div className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-1.5 border-b border-slate-200/40 dark:border-slate-800/40">
                                Modify Objective Core Properties
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[9px] font-mono uppercase font-bold text-slate-500 dark:text-slate-500 dark:text-slate-500 block">Objective Title</label>
                                <input
                                  type="text"
                                  value={task.title || ''}
                                  onChange={(e) => updateTaskField(task.categoryId, task.id, 'title', e.target.value)}
                                  placeholder="Enter title..."
                                  className="w-full bg-white dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-mono uppercase font-bold text-slate-500 dark:text-slate-500 dark:text-slate-500 block">Scheduled Time</label>
                                  <input
                                    type="text"
                                    value={task.time || ''}
                                    onChange={(e) => updateTaskField(task.categoryId, task.id, 'time', e.target.value)}
                                    placeholder="e.g. 09:30 AM"
                                    className="w-full bg-white dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-mono uppercase font-bold text-slate-500 dark:text-slate-500 dark:text-slate-500 block">Priority Level</label>
                                  <select
                                    value={task.priority || 'none'}
                                    onChange={(e) => updateTaskField(task.categoryId, task.id, 'priority', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                                  >
                                    <option value="none">None</option>
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-mono uppercase font-bold text-slate-500 dark:text-slate-500 dark:text-slate-500 block">Strategic Goal</label>
                                  <select
                                    value={goals.find(g => g.title === task.goalTitle)?.id || ''}
                                    onChange={(e) => {
                                      const selectedGoal = goals.find(g => g.id === e.target.value);
                                      updateTaskField(task.categoryId, task.id, 'goalTitle', selectedGoal ? selectedGoal.title : undefined);
                                    }}
                                    className="w-full bg-white dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                                  >
                                    <option value="">No goal linked</option>
                                    {goals.map(g => (
                                      <option key={g.id} value={g.id}>{g.title}</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[9px] font-mono uppercase font-bold text-slate-500 dark:text-slate-500 dark:text-slate-500 block">Recurrence / Repeat</label>
                                  <select
                                    value={task.recurrence ? task.recurrence.frequency : 'never'}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === 'never') {
                                        updateTaskField(task.categoryId, task.id, 'recurrence', undefined);
                                      } else {
                                        updateTaskField(task.categoryId, task.id, 'recurrence', { frequency: val, endCondition: 'forever' });
                                      }
                                    }}
                                    className="w-full bg-white dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                                  >
                                    <option value="never">Never (Once)</option>
                                    <option value="daily">Every Day</option>
                                    <option value="weekly">Every Week</option>
                                    <option value="monthly">Every Month</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Notes Box */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono uppercase font-bold text-slate-500 dark:text-slate-500 dark:text-slate-500 block">Notes & Insights</label>
                              <textarea
                                value={task.notes}
                                placeholder="Log custom reminders, details, or operational instructions..."
                                rows={2}
                                onChange={(e) => updateTaskField(task.categoryId, task.id, 'notes', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:border-red-500/50 transition-all resize-none"
                              />
                            </div>

                            {/* Subtasks checklists */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <label className="text-[9px] font-mono uppercase font-bold text-slate-500 dark:text-slate-500 dark:text-slate-500">Interactive Subtasks</label>
                                <span className="text-[9px] font-mono text-cyan-500">
                                  {task.subtasks?.filter((st: any) => st.completed).length || 0}/
                                  {task.subtasks?.length || 0} Complete
                                </span>
                              </div>

                              {/* Progress bar */}
                              {task.subtasks?.length > 0 && (
                                <div className="w-full h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                    style={{ 
                                      width: `${((task.subtasks.filter((st: any) => st.completed).length / task.subtasks.length) * 100) || 0}%` 
                                    }}
                                  />
                                </div>
                              )}

                              <div className="space-y-1.5 max-h-[140px] overflow-y-auto no-scrollbar">
                                {task.subtasks?.map((st: any) => (
                                  <div key={st.id} className="flex items-center justify-between gap-2.5 bg-slate-50/50 dark:bg-slate-950/20 p-2 rounded-xl border border-slate-100 dark:border-slate-900">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = task.subtasks.map((item: any) => 
                                            item.id === st.id ? { ...item, completed: !item.completed } : item
                                          );
                                          updateTaskField(task.categoryId, task.id, 'subtasks', updated);
                                        }}
                                        className="w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0"
                                      >
                                        {st.completed && <Check className="w-2.5 h-2.5 text-emerald-500 stroke-[4]" />}
                                      </button>
                                      <span className={`text-[10.5px] leading-tight truncate ${st.completed ? 'text-slate-600 dark:text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {st.title}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = task.subtasks.filter((item: any) => item.id !== st.id);
                                        updateTaskField(task.categoryId, task.id, 'subtasks', updated);
                                      }}
                                      className="text-slate-405 hover:text-red-500 transition-all cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Add Subtask Input */}
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="+ Add subtask step..."
                                  id={`add-sub-${task.id}`}
                                  className="flex-1 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80 px-2.5 py-1.5 rounded-xl text-[10.5px] text-slate-800 dark:text-slate-300 focus:outline-none focus:border-red-500/50"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                      const title = e.currentTarget.value.trim();
                                      const updated = [...(task.subtasks || []), { id: `st-${Date.now()}`, title, completed: false }];
                                      updateTaskField(task.categoryId, task.id, 'subtasks', updated);
                                      e.currentTarget.value = '';
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const inputEl = document.getElementById(`add-sub-${task.id}`) as HTMLInputElement;
                                    if (inputEl && inputEl.value.trim()) {
                                      const title = inputEl.value.trim();
                                      const updated = [...(task.subtasks || []), { id: `st-${Date.now()}`, title, completed: false }];
                                      updateTaskField(task.categoryId, task.id, 'subtasks', updated);
                                      inputEl.value = '';
                                    }
                                  }}
                                  className="px-2.5 py-1 text-[10px] font-mono uppercase font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                                >
                                  Add
                                </button>
                              </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="space-y-2">
                              <label className="text-[9px] font-mono uppercase font-bold text-slate-500 dark:text-slate-500 dark:text-slate-500 block">Linked Attachments</label>
                              <div className="grid grid-cols-2 gap-2">
                                {task.attachments?.map((at: any, i: number) => (
                                  <div key={i} className="p-2 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 rounded-xl flex items-center justify-between text-[10px] min-w-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                                      <div className="truncate text-left">
                                        <p className="font-semibold truncate text-slate-750 dark:text-slate-250">{at.name}</p>
                                        <p className="text-[8.5px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">{at.size}</p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = task.attachments.filter((_: any, idx: number) => idx !== i);
                                        updateTaskField(task.categoryId, task.id, 'attachments', updated);
                                      }}
                                      className="text-slate-600 dark:text-slate-400 hover:text-red-500 shrink-0"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Upload buttons */}
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const randoms = [
                                      { name: 'Training_Log_Week12.pdf', size: '1.24 MB', type: 'application/pdf' },
                                      { name: 'Investment_Assets_Ledger.xlsx', size: '0.94 MB', type: 'excel' },
                                      { name: 'Core_Logic_Flowchart.png', size: '2.40 MB', type: 'image' }
                                    ];
                                    const pick = randoms[Math.floor(Math.random() * randoms.length)];
                                    const updated = [...(task.attachments || []), pick];
                                    updateTaskField(task.categoryId, task.id, 'attachments', updated);
                                  }}
                                  className="px-3 py-1.5 text-[9.5px] font-mono font-bold bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 dark:text-slate-500 rounded-xl flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Paperclip className="w-3.5 h-3.5" /> Attach Document
                                </button>
                              </div>
                            </div>

                            {/* Inline Fields Grid */}
                            <div className="grid grid-cols-2 gap-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-900/60 text-[10.5px]">
                              <div className="space-y-1">
                                <span className="font-mono text-[8.5px] text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase block font-bold">Estimated Duration</span>
                                <select
                                  value={task.estimatedDuration}
                                  onChange={(e) => updateTaskField(task.categoryId, task.id, 'estimatedDuration', e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/80 px-2.5 py-1.5 rounded-xl text-[10.5px] text-slate-800 dark:text-slate-300 focus:outline-none"
                                >
                                  <option value="15m">15 Minutes</option>
                                  <option value="30m">30 Minutes</option>
                                  <option value="45m">45 Minutes</option>
                                  <option value="1h">1 Hour</option>
                                  <option value="1h 30m">1.5 Hours</option>
                                  <option value="2h">2 Hours</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <span className="font-mono text-[8.5px] text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase block font-bold">Schedule Reminder</span>
                                <select
                                  value={task.reminderLeadTime}
                                  onChange={(e) => updateTaskField(task.categoryId, task.id, 'reminderLeadTime', parseInt(e.target.value))}
                                  className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/80 px-2.5 py-1.5 rounded-xl text-[10.5px] text-slate-800 dark:text-slate-300 focus:outline-none"
                                >
                                  <option value={0}>At time of event</option>
                                  <option value={5}>5 mins before</option>
                                  <option value={15}>15 mins before</option>
                                  <option value={30}>30 mins before</option>
                                  <option value={60}>1 hour before</option>
                                </select>
                              </div>
                            </div>

                          </div>
                        )}

                        {/* Badges footer row */}
                        {!isExpanded && (task.time || task.priority !== 'none' || task.tags?.length > 0 || task.subtasks?.length > 0) && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-slate-900/40">
                            {task.time && (
                              <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono flex items-center gap-0.5 bg-amber-500/5 px-2 py-0.5 rounded-lg border border-amber-500/10">
                                <Clock className="w-2.5 h-2.5" /> {task.time}
                              </span>
                            )}
                            {task.priority !== 'none' && (
                              <span className="text-[9px] text-[#f43f5e] font-mono flex items-center gap-0.5 bg-red-500/5 px-2 py-0.5 rounded-lg border border-red-500/10 uppercase">
                                <Flag className="w-2.5 h-2.5" /> {task.priority}
                              </span>
                            )}
                            {task.subtasks?.length > 0 && (
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-0.5 bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                                <Check className="w-2.5 h-2.5" /> {task.subtasks.filter((s: any) => s.completed).length}/{task.subtasks.length} SUBTASKS
                              </span>
                            )}
                            {task.tags?.map((tg: string, i: number) => (
                              <span key={i} className="text-[9px] text-cyan-600 dark:text-cyan-400 font-mono flex items-center gap-0.5 bg-cyan-500/5 px-2 py-0.5 rounded-lg border border-cyan-500/10">
                                <Tag className="w-2.5 h-2.5" /> #{tg}
                              </span>
                            ))}
                          </div>
                        )}

                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Collapsible Evening reflections log */}
          {totalTasks > 0 && (
            <div className="bg-white/70 dark:bg-slate-950/20 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-sm text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-mono font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                    🌙 Evening Reflections
                  </h4>
                </div>
                <span className="text-[9px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-500">
                  Submit ledger reports
                </span>
              </div>

              <div className="space-y-3">
                <textarea 
                  rows={3}
                  placeholder="What high-stakes objectives did you conquer? Any blockers or strategic modifications?"
                  value={eveningNotes}
                  onChange={(e) => setEveningNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-250/50 dark:border-slate-800/80 rounded-2xl p-3 text-xs text-slate-800 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:border-red-500/40 transition-all resize-none"
                />
                
                <button 
                  type="button"
                  onClick={submitEveningReport}
                  className="w-full bg-gradient-to-r from-red-500/10 to-red-500/15 hover:from-red-500/20 hover:to-red-500/25 border border-red-500/20 hover:border-red-500/40 text-red-600 dark:text-red-400 font-mono text-[10px] font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm transition-all uppercase tracking-widest cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Publish to Performance Ledger
                </button>
              </div>
            </div>
          )}

          {/* Sound Controls & Permissions banner */}
          <div className="bg-slate-50/60 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/60 p-4 rounded-2xl text-left flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
                ALERT PARAMETERS
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-slate-500">
                Trigger real-time iOS push sound loops.
              </p>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
                title="Enable Push Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setHasSound(!hasSound)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  hasSound
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
                title="Toggle Bell Sound Alert"
              >
                {hasSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>

      </div>



      {/* --- iOS-STYLE SLIDING BOTTOM ACTION SHEET (QUICK ADD FORM) --- */}
      <AnimatePresence>
        {isQuickAddOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-sm select-none">
            {/* Backdrop Dismiss Trigger */}
            <div className="absolute inset-0" onClick={() => setIsQuickAddOpen(false)} />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 180 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800 rounded-t-[32px] p-6 shadow-2xl space-y-5 text-left relative z-10 max-h-[92vh] overflow-y-auto no-scrollbar"
            >
              {/* Grab handle indicator */}
              <div className="w-12 h-1 bg-slate-300 dark:bg-slate-800 rounded-full mx-auto -mt-2 mb-4" />

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-red-500" />
                  <h3 className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                    Create Action Node
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleAddTaskSubmit} className="space-y-4">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase tracking-wider block font-bold">
                    Raw Input (Supports Natural Language Parsing)
                  </label>
                  <input
                    type="text"
                    required
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder="e.g. Do muscular lifting tomorrow at 9am #health !!!"
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-250/50 dark:border-slate-800/80 focus:border-red-500 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none transition-all"
                  />
                  
                  {/* NLP real-time auto-extract visual feedback */}
                  {rawInput.trim() && (
                    <div className="bg-cyan-500/[0.03] dark:bg-cyan-500/[0.01] border border-cyan-500/10 px-3.5 py-2 rounded-xl text-[10px] space-y-1">
                      <p className="text-cyan-500 font-mono font-bold text-[8.5px] uppercase tracking-wider">💡 Real-time NLP Feedback:</p>
                      <div className="flex flex-wrap gap-1.5 mt-1 font-mono">
                        <span className="text-slate-550 dark:text-slate-300">Title: "{parsedNLP.title || '...'}"</span>
                        {parsedNLP.dateStr && <span className="text-amber-500">📅 Date: {parsedNLP.dateStr}</span>}
                        {parsedNLP.timeStr && <span className="text-emerald-500">⏰ Time: {parsedNLP.timeStr}</span>}
                        {parsedNLP.priority !== 'none' && <span className="text-red-500 uppercase">🚩 Priority: {parsedNLP.priority}</span>}
                        {parsedNLP.tags.map((t, idx) => (
                          <span key={idx} className="text-cyan-500">🏷️ #{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtask additions inside creation flow */}
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase tracking-wider block font-bold">
                    Define Task Sub-Checkpoints
                  </label>
                  
                  {subtasksInput.length > 0 && (
                    <div className="space-y-1">
                      {subtasksInput.map((st, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 text-[10.5px]">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{st}</span>
                          <button
                            type="button"
                            onClick={() => setSubtasksInput(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-slate-600 dark:text-slate-400 hover:text-red-500 shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add sub-item checkpoint..."
                      value={subtaskText}
                      onChange={(e) => setSubtaskText(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-250/50 dark:border-slate-800/80 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500 rounded-xl"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && subtaskText.trim()) {
                          e.preventDefault();
                          setSubtasksInput(prev => [...prev, subtaskText.trim()]);
                          setSubtaskText('');
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (subtaskText.trim()) {
                          setSubtasksInput(prev => [...prev, subtaskText.trim()]);
                          setSubtaskText('');
                        }
                      }}
                      className="px-3 py-1 text-[10px] font-mono uppercase bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-bold"
                    >
                      Append
                    </button>
                  </div>
                </div>

                {/* iOS Bottom Sheet Time Wheel Picker Trigger */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase tracking-wider block font-bold">
                    Objective Time Target
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsTimePickerSheetOpen(true)}
                    className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 border border-slate-250/50 dark:border-slate-800/80 px-4 py-3 rounded-2xl hover:border-slate-400 dark:hover:border-slate-300 dark:border-slate-700 transition-all text-left cursor-pointer"
                  >
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-250">
                      🕒 {taskTime || '09:00 AM'}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-500 dark:text-[#f43f5e] uppercase tracking-wider font-extrabold bg-cyan-500/10 dark:bg-[#f43f5e]/10 px-2.5 py-1 rounded-lg">
                      Open iOS Picker
                    </span>
                  </button>
                </div>

                {/* Quick select buttons Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase block font-bold">Agenda Category</label>
                    <select
                      value={taskCategory}
                      onChange={(e) => setTaskCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-250/50 dark:border-slate-800/80 px-3 py-2 text-xs text-slate-800 dark:text-slate-300 focus:outline-none rounded-xl"
                    >
                      <option value="CORE FOCUS">CORE FOCUS</option>
                      <option value="WEALTH CREATION">WEALTH CREATION</option>
                      <option value="BECOME INCREDIBLY MUSCULAR">BECOME MUSCULAR</option>
                      <option value="BECOME INCREDIBLY INTELLIGENT">BECOME INTELLIGENT</option>
                      <option value="CUSTOM">-- Custom --</option>
                    </select>
                  </div>

                  {/* Goal Connection */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase block font-bold">Linked Goal</label>
                    <select
                      value={taskGoalId}
                      onChange={(e) => setTaskGoalId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-250/50 dark:border-slate-800/80 px-3 py-2 text-xs text-slate-800 dark:text-slate-300 focus:outline-none rounded-xl"
                    >
                      <option value="">-- No linked goal --</option>
                      {goals.map(g => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Priorities */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase block font-bold">Priority Badge</label>
                    <select
                      value={priorityInput}
                      onChange={(e) => setPriorityInput(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-250/50 dark:border-slate-800/80 px-3 py-2 text-xs text-slate-800 dark:text-slate-300 focus:outline-none rounded-xl"
                    >
                      <option value="none">None</option>
                      <option value="low">Low (Blue)</option>
                      <option value="medium">Medium (Orange)</option>
                      <option value="high">High (Red)</option>
                    </select>
                  </div>
                </div>

                {/* Reminders & Alarms + Recurrence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Reminder Type Selection */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase block font-bold flex items-center gap-1">
                      <Bell className="w-3 h-3 text-cyan-500" /> Reminder System
                    </label>
                    <select
                      value={reminderType}
                      onChange={(e) => setReminderType(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-250/50 dark:border-slate-800/80 px-3 py-2 text-xs text-slate-800 dark:text-slate-300 focus:outline-none rounded-xl"
                    >
                      <option value="none">None</option>
                      <option value="notification">Push Notification Banner</option>
                      <option value="alarm">🚨 Full-Screen Executive Alarm</option>
                    </select>
                  </div>

                  {/* Recurrence Selection */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase block font-bold flex items-center gap-1">
                      <Repeat className="w-3 h-3 text-[#f43f5e]" /> Recurrence (Repeat)
                    </label>
                    <select
                      value={recurrenceConfig ? recurrenceConfig.frequency : 'never'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'never') {
                          setLocalRecurrenceConfig(null);
                        } else if (val === 'daily') {
                          setLocalRecurrenceConfig({ frequency: 'daily', endCondition: 'forever' });
                        } else if (val === 'weekly') {
                          setLocalRecurrenceConfig({ frequency: 'weekly', endCondition: 'forever' });
                        } else if (val === 'monthly') {
                          setLocalRecurrenceConfig({ frequency: 'monthly', endCondition: 'forever' });
                        } else {
                          // Custom
                          setIsRecurrenceOpen(true);
                          setLocalRecurrenceConfig({ frequency: 'daily', endCondition: 'forever' });
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-250/50 dark:border-slate-800/80 px-3 py-2 text-xs text-slate-800 dark:text-slate-300 focus:outline-none rounded-xl"
                    >
                      <option value="never">Never (Once)</option>
                      <option value="daily">Every Day</option>
                      <option value="weekly">Every Week</option>
                      <option value="monthly">Every Month</option>
                      <option value="custom">⚙ Custom Repeat...</option>
                    </select>
                  </div>
                </div>

                {/* Custom Recurrence Config Sub-Form */}
                {isRecurrenceOpen && recurrenceConfig && (
                  <div className="bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800/80 rounded-2xl p-4 space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Custom Repeat Options
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsRecurrenceOpen(false)}
                        className="text-xs font-mono font-bold text-[#f43f5e] uppercase cursor-pointer"
                      >
                        Collapse
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-500">Frequency</label>
                        <select
                          value={recurrenceConfig.frequency}
                          onChange={(e) => setLocalRecurrenceConfig(prev => prev ? { ...prev, frequency: e.target.value as any } : null)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 rounded-xl focus:outline-none"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-500">End Condition</label>
                        <select
                          value={recurrenceConfig.endCondition}
                          onChange={(e) => setLocalRecurrenceConfig(prev => prev ? { ...prev, endCondition: e.target.value as any } : null)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-850 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 rounded-xl focus:outline-none"
                        >
                          <option value="forever">Forever</option>
                          <option value="until_date">Until Specific Date</option>
                        </select>
                      </div>
                    </div>

                    {recurrenceConfig.endCondition === 'until_date' && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-500">End Date (YYYY-MM-DD)</label>
                        <input
                          type="date"
                          value={recurrenceConfig.untilDate || ''}
                          onChange={(e) => setLocalRecurrenceConfig(prev => prev ? { ...prev, untilDate: e.target.value } : null)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-850 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 rounded-xl focus:outline-none font-mono"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Drag and Drop Attachments input box */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase tracking-wider block font-bold">
                    Objective Assets Attachments
                  </label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDropFile}
                    onClick={triggerSimulatedUpload}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all select-none ${
                      isDraggingFile 
                        ? 'border-cyan-500 bg-cyan-500/10' 
                        : 'border-slate-250 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30'
                    }`}
                  >
                    <Paperclip className="w-5 h-5 text-slate-600 dark:text-slate-400 mx-auto mb-1 animate-pulse" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-500">Drag & Drop specification files or click to simulate upload</p>
                    {attachmentsInput.length > 0 && (
                      <p className="text-[9px] font-mono text-cyan-500 mt-1.5 font-bold">
                        {attachmentsInput.length} Files Ready To Attach
                      </p>
                    )}
                  </div>

                  {attachmentsInput.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {attachmentsInput.map((f, idx) => (
                        <span key={idx} className="text-[8.5px] font-mono bg-cyan-500/5 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/10 flex items-center gap-1.5">
                          {f.name} ({f.size})
                          <button type="button" onClick={(e) => { e.stopPropagation(); setAttachmentsInput(prev => prev.filter((_, i) => i !== idx)); }} className="text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags manager */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-500 uppercase tracking-wider block font-bold">
                    Objective Category Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-250/50 dark:border-slate-800/80 min-h-[44px]">
                    {customTags.map((t, idx) => (
                      <span key={idx} className="text-[9px] font-mono bg-[#f43f5e]/10 text-[#f43f5e] px-2 py-0.5 rounded-lg border border-[#f43f5e]/20 flex items-center gap-1">
                        #{t}
                        <button type="button" onClick={() => setCustomTags(prev => prev.filter((_, i) => i !== idx))} className="font-bold text-red-500">×</button>
                      </span>
                    ))}
                    
                    <input
                      type="text"
                      placeholder="+ Type tag and Enter..."
                      className="bg-transparent border-0 focus:ring-0 p-0 text-[10px] font-mono text-slate-700 dark:text-slate-300 w-32 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim().replace('#', '');
                          if (!customTags.includes(val)) {
                            setCustomTags(prev => [...prev, val]);
                          }
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(false)}
                    className="flex-1 py-3 text-xs font-mono font-bold text-slate-500 dark:text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl hover:shadow-lg hover:shadow-cyan-500/15 transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Deploy Action Node
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- NATIVE APPLE-STYLE WHEEL PICKER IN A BOTTOM SHEET --- */}
      <IOSBottomSheetTimePicker
        isOpen={isTimePickerSheetOpen}
        onClose={() => setIsTimePickerSheetOpen(false)}
        value={taskTime}
        onChange={(newTime) => setTaskTime(newTime)}
        title="Set Target Time"
      />

      {/* --- FULL-SCREEN EXECUTIVE ALARM OVERLAY --- */}
      <AnimatePresence>
        {activeAlarmTask && (
          <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950/85 backdrop-blur-3xl z-[99] flex flex-col items-center justify-center p-6 text-center select-none pointer-events-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="space-y-8 max-w-md w-full"
            >
              {/* Pulsing visual element */}
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 rounded-full bg-[#f43f5e]/20 animate-ping" />
                <div className="absolute -inset-4 rounded-full bg-[#f43f5e]/10 animate-pulse" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#f43f5e] to-red-600 flex items-center justify-center text-white shadow-2xl shadow-red-500/40 animate-bounce">
                  <Bell className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Alarm headers */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-extrabold uppercase text-[#f43f5e] tracking-widest block animate-pulse">
                  ⚡ ACTIVE EXECUTIVE ALARM ⚡
                </span>
                <h2 className="text-xl font-sans font-black text-white tracking-tight break-words">
                  {activeAlarmTask.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  Target Time: {activeAlarmTask.time}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 pt-6 w-full max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    togglePowerTask(getWeekdayIdFromDate(activeAlarmTask.date), activeAlarmTask.categoryId, activeAlarmTask.id, activeAlarmTask.date);
                    stopAlarmSound();
                    setActiveAlarmTask(null);
                  }}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-extrabold text-xs rounded-2xl transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-widest cursor-pointer font-black"
                >
                  ✓ Complete Objective
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => snoozeAlarmTask(5)}
                    className="py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-850 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-[10px] rounded-2xl transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Snooze 5m
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopAlarmSound();
                      setActiveAlarmTask(null);
                    }}
                    className="py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-850 border border-slate-300 dark:border-slate-800 text-rose-500 font-mono font-bold text-[10px] rounded-2xl transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Silence
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PREMIUM NATIVE iOS BOTTOM DETAIL SHEET --- */}
      <AnimatePresence>
        {isDetailSheetOpen && selectedSheetTask && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailSheetOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            {/* Sheet Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200/60 dark:border-slate-800/80 p-6 space-y-6 text-left focus:outline-none z-10 max-h-[85vh] overflow-y-auto"
            >
              {/* Grabber Indicator */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mt-1">
                <h3 className="text-sm font-mono font-bold text-[#f43f5e] uppercase tracking-wider">
                  Objective Blueprints
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDetailSheetOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title Edit */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-extrabold uppercase text-slate-600 dark:text-slate-400 dark:text-slate-500 tracking-wider">
                  Objective Name
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 p-3 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#f43f5e]"
                />
              </div>

              {/* Grid: Time & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-extrabold uppercase text-slate-600 dark:text-slate-400 dark:text-slate-500 tracking-wider">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    placeholder="e.g. 09:00 AM"
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-extrabold uppercase text-slate-600 dark:text-slate-400 dark:text-slate-500 tracking-wider">
                    Estimated Duration
                  </label>
                  <select
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="15m">15 Minutes</option>
                    <option value="30m">30 Minutes</option>
                    <option value="45m">45 Minutes</option>
                    <option value="1h">1 Hour</option>
                    <option value="1.5h">1.5 Hours</option>
                    <option value="2h">2 Hours</option>
                    <option value="3h">3 Hours</option>
                  </select>
                </div>
              </div>

              {/* Grid: Reminder & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-extrabold uppercase text-slate-600 dark:text-slate-400 dark:text-slate-500 tracking-wider">
                    Lead Reminder
                  </label>
                  <select
                    value={editReminder}
                    onChange={(e) => setEditReminder(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="none">None</option>
                    <option value="notification">Push Notification</option>
                    <option value="alarm">Loud Alarm Sound</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-extrabold uppercase text-slate-600 dark:text-slate-400 dark:text-slate-500 tracking-wider">
                    Task Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="none">None</option>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              {/* Goal Title Selector */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-extrabold uppercase text-slate-600 dark:text-slate-400 dark:text-slate-500 tracking-wider">
                  Associated Strategic Goal
                </label>
                <select
                  value={editGoalId}
                  onChange={(e) => setEditGoalId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  <option value="">No strategic goal link</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>

              {/* Recurrence Selection in Details Sheet */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-extrabold uppercase text-slate-600 dark:text-slate-400 dark:text-slate-500 tracking-wider">
                  Recurrence / Repeat (Every Day, etc.)
                </label>
                <select
                  value={editRecurrence ? editRecurrence.frequency : 'never'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'never') {
                      setEditRecurrence(null);
                    } else {
                      setEditRecurrence({ frequency: val, endCondition: 'forever' });
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                >
                  <option value="never">Never (Once)</option>
                  <option value="daily">Every Day</option>
                  <option value="weekly">Every Week</option>
                  <option value="monthly">Every Month</option>
                </select>
              </div>

              {/* Notes Area */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-extrabold uppercase text-slate-600 dark:text-slate-400 dark:text-slate-500 tracking-wider">
                  Strategic Execution Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Blockers, subtasks, criteria for excellence..."
                  className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/80 p-3 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              {/* Actions Section */}
              <div className="flex flex-wrap gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                {/* Complete Button */}
                <button
                  type="button"
                  onClick={() => {
                    togglePowerTask(selectedSheetTask.dayId || getWeekdayIdFromDate(selectedSheetTask.date), selectedSheetTask.categoryId, selectedSheetTask.id, selectedSheetTask.date);
                    setIsDetailSheetOpen(false);
                  }}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-bold text-[10px] rounded-xl tracking-wider transition-all uppercase shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  {selectedSheetTask.completed ? "Reopen Objective" : "Complete Now"}
                </button>

                {/* Save Changes */}
                <button
                  type="button"
                  onClick={handleSaveDetailsSheet}
                  className="flex-1 py-3 bg-[#f43f5e] hover:bg-rose-600 text-white font-mono font-bold text-[10px] rounded-xl tracking-wider transition-all uppercase shadow-md shadow-rose-500/10 cursor-pointer"
                >
                  Save Changes
                </button>

                {/* Duplicate */}
                <button
                  type="button"
                  onClick={() => {
                    const dayId = selectedSheetTask.dayId || getWeekdayIdFromDate(selectedSheetTask.date);
                    addPowerTask(dayId, selectedSheetTask.categoryId, `${editTitle} (Copy)`, selectedSheetTask.date, editTime, selectedSheetTask.goalTitle);
                    setIsDetailSheetOpen(false);
                    setActiveNotification({
                      id: Math.random().toString(),
                      title: "📝 Task Duplicated",
                      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    });
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200/40 dark:border-slate-700/60 text-slate-750 dark:text-slate-200 font-mono font-bold text-[10px] rounded-xl uppercase transition-all cursor-pointer"
                >
                  Duplicate
                </button>

                {/* Delete button from sheet */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailSheetOpen(false);
                    setDeleteConfirmTask({
                      dayId: selectedSheetTask.dayId || getWeekdayIdFromDate(selectedSheetTask.date),
                      categoryId: selectedSheetTask.categoryId,
                      taskId: selectedSheetTask.id,
                      date: selectedSheetTask.date,
                      title: selectedSheetTask.title,
                      isRecurring: !!selectedSheetTask.recurrence
                    });
                  }}
                  className="px-4 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 border border-rose-200/40 text-rose-500 font-mono font-bold text-[10px] rounded-xl uppercase transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PREMIUM NATIVE iOS DELETE DIALOG --- */}
      <AnimatePresence>
        {deleteConfirmTask && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmTask(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Dialog Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center z-10 select-none"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-2">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-sans font-extrabold text-slate-850 dark:text-slate-100">
                  Delete Objective Blueprint?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-500 leading-relaxed">
                  Are you absolutely sure you want to remove <span className="font-bold text-slate-800 dark:text-slate-300">"{deleteConfirmTask.title}"</span>? This action cannot be reversed.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {deleteConfirmTask.isRecurring ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        deletePowerTask(deleteConfirmTask.dayId, deleteConfirmTask.categoryId, deleteConfirmTask.taskId, deleteConfirmTask.date);
                        setDeleteConfirmTask(null);
                      }}
                      className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-mono font-bold text-[10px] rounded-xl tracking-wider transition-all uppercase cursor-pointer"
                    >
                      Only This Occurrence
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Delete all matching future occurrences
                        deletePowerTask(deleteConfirmTask.dayId, deleteConfirmTask.categoryId, deleteConfirmTask.taskId, deleteConfirmTask.date, true);
                        setDeleteConfirmTask(null);
                      }}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-[10px] rounded-xl tracking-wider transition-all uppercase cursor-pointer"
                    >
                      All Series Occurrences
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      deletePowerTask(deleteConfirmTask.dayId, deleteConfirmTask.categoryId, deleteConfirmTask.taskId, deleteConfirmTask.date);
                      setDeleteConfirmTask(null);
                    }}
                    className="w-full py-2.5 bg-[#f43f5e] hover:bg-rose-600 text-white font-mono font-bold text-[10px] rounded-xl tracking-wider transition-all uppercase cursor-pointer"
                  >
                    Delete Objective
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTask(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-mono font-bold text-[10px] rounded-xl tracking-wider transition-all uppercase cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- FLOATING iOS ACTION BUTTON & EXPANDING MENU --- */}
      <div className="fixed bottom-6 right-6 z-45 flex flex-col items-end gap-3.5">
        <AnimatePresence>
          {isFabOpen && (
            <div className="flex flex-col gap-2 mb-1.5 text-right">
              {[
                { label: "Create Task", icon: PlusCircle, action: () => { setIsQuickAddOpen(true); setIsFabOpen(false); } },
                { label: "Quick Note", icon: StickyNote, action: () => { setEveningNotes(eveningNotes + "\n📝 [Quick Note]: "); setIsFabOpen(false); } },
                { label: "Add Reminder", icon: Bell, action: () => { setReminderType('notification'); setIsQuickAddOpen(true); setIsFabOpen(false); } },
                { label: "Set Goal", icon: Target, action: () => { setIsQuickAddOpen(true); setIsFabOpen(false); } },
                { label: "New Habit", icon: Flame, action: () => { setLocalRecurrenceConfig({ frequency: 'daily', endCondition: 'forever' }); setIsQuickAddOpen(true); setIsFabOpen(false); } },
                { label: "Meeting Block", icon: Users, action: () => { setRawInput("Meeting: "); setIsQuickAddOpen(true); setIsFabOpen(false); } }
              ].map((item, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ delay: idx * 0.04, type: 'spring', stiffness: 260, damping: 20 }}
                  onClick={item.action}
                  className="flex items-center gap-2.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xl hover:bg-slate-50 dark:hover:bg-slate-100 dark:bg-slate-800 transition-all text-slate-850 dark:text-slate-100 font-mono text-[10px] font-bold cursor-pointer uppercase tracking-wider"
                >
                  <span>{item.label}</span>
                  <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-300">
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setIsFabOpen(!isFabOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full bg-[#f43f5e] text-white flex items-center justify-center shadow-2xl hover:bg-rose-600 transition-all cursor-pointer relative z-10"
        >
          <motion.div
            animate={{ rotate: isFabOpen ? 135 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </motion.div>
        </motion.button>
      </div>

    </div>
  );
}
