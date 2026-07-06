import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, Plus, Calendar, ChevronLeft, ChevronRight, AlertTriangle, 
  Target, AlertCircle, Sparkles, Check, Trash2, Edit2, Info, Bell, Repeat, Flame 
} from 'lucide-react';
import { Goal } from '../types';

export interface TimelineTask {
  id: string;
  title: string;
  completed: boolean;
  time?: string;          // Start Time (e.g., "09:30 AM")
  endTime?: string;       // End Time (e.g., "11:00 AM")
  duration?: number;      // Duration in minutes
  priority?: 'none' | 'low' | 'medium' | 'high';
  categoryName?: string;
  categoryId?: string;
  goalTitle?: string;
  goalId?: string;
  color?: string;         // Hex code or tailwind color name
  date: string;           // YYYY-MM-DD
  reminderType?: 'none' | 'notification' | 'alarm';
  notes?: string;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | 'custom';
    endCondition?: 'forever' | 'until';
  };
}

interface TimelineViewProps {
  tasks: TimelineTask[];
  activeDateStr: string;
  setActiveDate: (dateStr: string) => void;
  goals: Goal[];
  onUpdateTask: (dayId: string, categoryId: string, taskId: string, fields: Partial<TimelineTask>) => void;
  onDeleteTask: (dayId: string, categoryId: string, taskId: string) => void;
  onToggleTask: (dayId: string, categoryId: string, taskId: string) => void;
  onSlotClick: (timeStr: string, dateStr: string) => void;
  getWeekdayIdFromDate: (dateStr: string) => string;
  onTaskClick?: (task: any) => void;
  onLetAIPlan?: () => void;
  onImportCalendar?: () => void;
}

// Helpers for converting time
export function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 540; // default 9:00 AM
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const numbersPart = clean.replace(/[AP]M/, '').trim();
  const parts = numbersPart.split(':');
  let hours = parseInt(parts[0]) || 0;
  const minutes = parts[1] ? parseInt(parts[1]) : 0;
  
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}

export function formatMinutesToTimeStr(minutes: number): string {
  const normalized = (minutes + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
}

export default function TimelineView({
  tasks,
  activeDateStr,
  setActiveDate,
  goals,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
  onSlotClick,
  getWeekdayIdFromDate,
  onTaskClick,
  onLetAIPlan,
  onImportCalendar,
}: TimelineViewProps) {
  const [calendarView, setCalendarView] = useState<'day' | '3day' | 'week' | 'month' | 'agenda'>('day');
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  
  // Drag-and-drop / Resize states
  const [draggingTask, setDraggingTask] = useState<{
    task: TimelineTask;
    type: 'move' | 'resize';
    startY: number;
    startX: number;
    startMinutes: number;
    startDuration: number;
    originalDate: string;
    currentOffsetMinutes: number;
    currentDeltaDays: number;
  } | null>(null);

  // Conflict resolution state
  const [conflictTask, setConflictTask] = useState<{ task1: TimelineTask; task2: TimelineTask } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const hourHeight = 64; // 1 hour = 64px, so 1 minute = 1.06px
  const startHour = 6; // 6 AM
  const endHour = 23; // 11 PM
  const visibleHours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);

  // Parse tasks to ensure they have default duration and endTime
  const processedTasks = tasks.map(t => {
    const startMins = parseTimeToMinutes(t.time);
    const dur = t.duration || 60;
    const endMins = startMins + dur;
    const computedEndTime = formatMinutesToTimeStr(endMins);
    return {
      ...t,
      duration: dur,
      endTime: t.endTime || computedEndTime,
      startMins,
      endMins,
    };
  });

  // Calculate Conflicts
  const checkConflictsForTask = (targetTask: TimelineTask, dateStr: string, startM: number, endM: number) => {
    return processedTasks.find(t => {
      if (t.id === targetTask.id) return false;
      if (t.date !== dateStr) return false;
      const otherStart = parseTimeToMinutes(t.time);
      const otherEnd = otherStart + (t.duration || 60);
      return Math.max(startM, otherStart) < Math.min(endM, otherEnd);
    });
  };

  // Switch tabs/view logic
  const handleNavToGoal = (goalId?: string) => {
    if (!goalId) return;
    // Dispatch custom tab navigation event to redirect to Goals panel
    window.dispatchEvent(new CustomEvent('change-tab', { detail: 'goals' }));
  };

  // Get active range dates
  const getDatesForView = (): string[] => {
    const active = new Date(activeDateStr);
    if (calendarView === 'day') {
      return [activeDateStr];
    }
    if (calendarView === '3day') {
      const dates = [];
      for (let i = -1; i <= 1; i++) {
        const d = new Date(active);
        d.setDate(active.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
      return dates;
    }
    if (calendarView === 'week') {
      const dates = [];
      const dayOfWeek = active.getDay(); // 0-6
      const startOfWeek = new Date(active);
      startOfWeek.setDate(active.getDate() - dayOfWeek);
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
      return dates;
    }
    return [activeDateStr];
  };

  const viewDates = getDatesForView();

  // Mouse Listeners for Drag-to-Reposition and Resize
  const handleTaskMouseDown = (e: React.MouseEvent, task: TimelineTask, type: 'move' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();
    const startMins = parseTimeToMinutes(task.time);
    setDraggingTask({
      task,
      type,
      startY: e.clientY,
      startX: e.clientX,
      startMinutes: startMins,
      startDuration: task.duration || 60,
      originalDate: task.date,
      currentOffsetMinutes: 0,
      currentDeltaDays: 0,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingTask) return;
      const deltaY = e.clientY - draggingTask.startY;
      const deltaX = e.clientX - draggingTask.startX;
      
      // Calculate delta minutes (snap to 15-min increments)
      const minutesPerPixel = 60 / hourHeight;
      const rawDeltaMins = deltaY * minutesPerPixel;
      const snappedDeltaMins = Math.round(rawDeltaMins / 15) * 15;

      // In multi-column, calculate horizontal day shifts
      let deltaDays = 0;
      if (calendarView === '3day' || calendarView === 'week') {
        const columnWidth = containerRef.current ? containerRef.current.clientWidth / viewDates.length : 200;
        deltaDays = Math.round(deltaX / columnWidth);
      }

      setDraggingTask(prev => prev ? {
        ...prev,
        currentOffsetMinutes: snappedDeltaMins,
        currentDeltaDays: deltaDays,
      } : null);
    };

    const handleMouseUp = () => {
      if (!draggingTask) return;
      
      const targetDate = new Date(draggingTask.originalDate);
      targetDate.setDate(targetDate.getDate() + draggingTask.currentDeltaDays);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      let newStartMins = draggingTask.startMinutes;
      let newDuration = draggingTask.startDuration;

      if (draggingTask.type === 'move') {
        newStartMins += draggingTask.currentOffsetMinutes;
      } else if (draggingTask.type === 'resize') {
        newDuration += draggingTask.currentOffsetMinutes;
        if (newDuration < 15) newDuration = 15; // minimum 15 mins
      }

      // Constrain inside bounds
      if (newStartMins < 0) newStartMins = 0;
      if (newStartMins + newDuration > 1440) newStartMins = 1440 - newDuration;

      const newTimeStr = formatMinutesToTimeStr(newStartMins);
      const newEndTimeStr = formatMinutesToTimeStr(newStartMins + newDuration);

      // Check conflicts
      const conflict = checkConflictsForTask(draggingTask.task, targetDateStr, newStartMins, newStartMins + newDuration);
      if (conflict) {
        setConflictTask({
          task1: { ...draggingTask.task, time: newTimeStr, endTime: newEndTimeStr, duration: newDuration, date: targetDateStr },
          task2: conflict,
        });
      } else {
        // Apply update directly
        const wkday = getWeekdayIdFromDate(draggingTask.originalDate);
        onUpdateTask(wkday, draggingTask.task.categoryId || 'uncategorized', draggingTask.task.id, {
          time: newTimeStr,
          endTime: newEndTimeStr,
          duration: newDuration,
          date: targetDateStr,
        });
      }

      setDraggingTask(null);
    };

    if (draggingTask) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingTask]);

  // Color mapper based on category
  const getCategoryStyles = (category?: string, completed?: boolean) => {
    if (completed) {
      return {
        bg: 'bg-slate-50 dark:bg-slate-900/10 hover:bg-slate-100/30',
        border: 'border-slate-200/50 dark:border-slate-800/50',
        text: 'text-slate-600 dark:text-slate-400 dark:text-slate-500 line-through',
        badge: 'bg-slate-100 text-slate-500 dark:text-slate-500 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
        stripColor: '#9CA3AF'
      };
    }
    const cat = (category || '').toLowerCase();
    if (cat.includes('rich') || cat.includes('wealth') || cat.includes('work')) {
      return { 
        bg: 'bg-blue-500/[0.04] dark:bg-blue-500/[0.02] hover:bg-blue-500/[0.08]', 
        border: 'border-blue-500/20 dark:border-blue-500/30', 
        text: 'text-blue-600 dark:text-blue-400', 
        badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
        stripColor: '#3B82F6'
      };
    }
    if (cat.includes('muscul') || cat.includes('health') || cat.includes('gym')) {
      return { 
        bg: 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.02] hover:bg-emerald-500/[0.08]', 
        border: 'border-emerald-500/20 dark:border-emerald-500/30', 
        text: 'text-emerald-600 dark:text-emerald-400', 
        badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        stripColor: '#10B981'
      };
    }
    if (cat.includes('intel') || cat.includes('exam') || cat.includes('study') || cat.includes('personal')) {
      return { 
        bg: 'bg-purple-500/[0.04] dark:bg-purple-500/[0.02] hover:bg-purple-500/[0.08]', 
        border: 'border-purple-500/20 dark:border-purple-500/30', 
        text: 'text-purple-600 dark:text-purple-400', 
        badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
        stripColor: '#8B5CF6'
      };
    }
    if (cat.includes('urgent') || cat.includes('critical')) {
      return { 
        bg: 'bg-rose-500/[0.04] dark:bg-rose-500/[0.02] hover:bg-rose-500/[0.08]', 
        border: 'border-rose-500/20 dark:border-rose-500/30', 
        text: 'text-rose-600 dark:text-rose-400', 
        badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
        stripColor: '#EF4444'
      };
    }
    if (cat.includes('finance')) {
      return { 
        bg: 'bg-orange-500/[0.04] dark:bg-orange-500/[0.02] hover:bg-orange-500/[0.08]', 
        border: 'border-orange-500/20 dark:border-orange-500/30', 
        text: 'text-orange-600 dark:text-orange-400', 
        badge: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
        stripColor: '#F59E0B'
      };
    }
    return { 
      bg: 'bg-amber-500/[0.04] dark:bg-amber-500/[0.02] hover:bg-amber-500/[0.08]', 
      border: 'border-amber-500/20 dark:border-amber-500/30', 
      text: 'text-amber-600 dark:text-amber-400', 
      badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
      stripColor: '#F59E0B'
    };
  };

  // Format header names
  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
  };

  // Render Day, 3-Day, and Week Views
  const renderTimelineGrid = () => {
    return (
      <div className="relative flex flex-col h-[700px] bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-4 select-none overflow-hidden shadow-sm">
        {/* Day Column Headers */}
        <div className="flex pl-16 border-b border-slate-200 dark:border-slate-800/50 pb-2.5 mb-2 shrink-0">
          {viewDates.map((dStr, idx) => {
            const isToday = dStr === activeDateStr;
            return (
              <div 
                key={idx} 
                className={`flex-1 text-center font-sans text-xs md:text-sm font-bold transition-all cursor-pointer ${isToday ? 'text-cyan-500 dark:text-red-400 scale-105' : 'text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-slate-200'}`}
                onClick={() => setActiveDate(dStr)}
              >
                {formatDateHeader(dStr)}
                {isToday && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-red-500 mx-auto mt-1" />}
              </div>
            );
          })}
        </div>

        {/* Scrollable grid contents */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative" ref={containerRef}>
          <div className="absolute top-0 left-0 right-0 h-[1152px] pointer-events-none">
            {/* Hour marker lines */}
            {visibleHours.map((hr) => {
              const topY = (hr - startHour) * hourHeight;
              return (
                <div 
                  key={hr} 
                  className="absolute left-16 right-0 border-t border-slate-200/30 dark:border-slate-800/30"
                  style={{ top: `${topY}px`, height: '1px' }}
                />
              );
            })}
          </div>

          {/* Time text sidebar column */}
          <div className="absolute top-0 left-0 w-16 bottom-0 pointer-events-none border-r border-slate-200/20 dark:border-slate-800/20">
            {visibleHours.map((hr) => {
              const topY = (hr - startHour) * hourHeight;
              const hours12 = hr % 12 === 0 ? 12 : hr % 12;
              const period = hr >= 12 ? 'PM' : 'AM';
              return (
                <div 
                  key={hr}
                  className="absolute left-0 w-full text-right pr-3 text-xs md:text-sm font-mono font-extrabold text-slate-500 dark:text-slate-500 dark:text-slate-400 uppercase select-none"
                  style={{ top: `${topY - 6}px` }}
                >
                  {hours12} {period}
                </div>
              );
            })}
          </div>

          {/* Interactive Columns for task insertion and mapping */}
          <div className="absolute top-0 left-16 right-0 bottom-0 flex" style={{ height: `${visibleHours.length * hourHeight}px` }}>
            {viewDates.map((dStr, colIdx) => {
              const colTasks = processedTasks.filter(t => t.date === dStr && t.time);
              
              return (
                <div 
                  key={dStr} 
                  className="flex-1 relative h-full border-r border-slate-100/10 dark:border-slate-900/10 last:border-0 group/col"
                  onMouseEnter={() => setHoveredHour(colIdx)}
                  onMouseLeave={() => setHoveredHour(null)}
                >
                  {/* Invisible hour blocks for slot clicking */}
                  {visibleHours.map((hr) => {
                    const topY = (hr - startHour) * hourHeight;
                    return (
                      <div 
                        key={hr}
                        onClick={() => {
                          const minVal = hr * 60;
                          onSlotClick(formatMinutesToTimeStr(minVal), dStr);
                        }}
                        className="absolute left-0 right-0 hover:bg-cyan-500/[0.04] dark:hover:bg-red-500/[0.04] transition-all cursor-pointer pointer-events-auto"
                        style={{ top: `${topY}px`, height: `${hourHeight}px` }}
                        title={`Schedule objective at ${formatMinutesToTimeStr(hr * 60)}`}
                      />
                    );
                  })}

                  {/* Absolute task cards */}
                  {colTasks.map((task) => {
                    // Check if active dragging matches this task
                    const isSelfDragging = draggingTask?.task.id === task.id;
                    let currentTop = (task.startMins - startHour * 60) * (hourHeight / 60);
                    let currentHeight = (task.duration || 60) * (hourHeight / 60);

                    if (isSelfDragging && draggingTask) {
                      if (draggingTask.type === 'move') {
                        currentTop += draggingTask.currentOffsetMinutes * (hourHeight / 60);
                      } else {
                        currentHeight += draggingTask.currentOffsetMinutes * (hourHeight / 60);
                        if (currentHeight < 15 * (hourHeight / 60)) currentHeight = 15 * (hourHeight / 60);
                      }
                    }

                    const style = getCategoryStyles(task.categoryName, task.completed);
                    const isDone = task.completed;

                    return (
                      <div
                        key={task.id}
                        className={`absolute left-2 right-2 rounded-2xl border-2 backdrop-blur-xl pl-4 pr-3 py-2 flex flex-col justify-between transition-shadow pointer-events-auto shadow-sm select-none ${style.bg} ${style.border} ${isSelfDragging ? 'opacity-80 scale-[1.01] shadow-xl z-30 cursor-grabbing ring-2 ring-cyan-400 dark:ring-red-400' : 'z-10 cursor-grab hover:shadow-md'}`}
                        style={{ 
                          top: `${currentTop}px`, 
                          height: `${currentHeight}px`,
                          minHeight: '48px'
                        }}
                        onMouseDown={(e) => {
                          // Allow buttons and resize handles to bypass drag start
                          if (e.target instanceof HTMLElement && e.target.closest('button, .cursor-ns-resize')) return;
                          handleTaskMouseDown(e, task, 'move');
                        }}
                        onClick={(e) => {
                          if (e.target instanceof HTMLElement && e.target.closest('button, .cursor-ns-resize')) return;
                          onTaskClick?.(task);
                        }}
                      >
                        {/* iOS-Style left edge color strip */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl" style={{ backgroundColor: style.stripColor }} />

                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-1 min-w-0">
                          <div className="flex items-start gap-2 min-w-0">
                            {/* Toggle completed checkbox */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const wkday = getWeekdayIdFromDate(task.date);
                                onToggleTask(wkday, task.categoryId || 'uncategorized', task.id);
                              }}
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-450 dark:border-slate-600 bg-white/50 dark:bg-slate-900/50'}`}
                            >
                              {isDone && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                            </button>

                            <div className="min-w-0">
                              <h5 className={`text-[11px] font-bold leading-tight truncate ${style.text} ${isDone ? 'line-through opacity-60' : ''}`}>
                                {task.title}
                              </h5>
                              <p className="text-[8.5px] font-mono font-semibold text-slate-500 dark:text-slate-500 dark:text-slate-400 mt-0.5">
                                {task.time} - {task.endTime || formatMinutesToTimeStr(task.startMins + (task.duration || 60))}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Priority Icon indicator */}
                            {task.priority && task.priority !== 'none' && (
                              <Flame className={`w-3.5 h-3.5 ${task.priority === 'high' ? 'text-red-500 animate-pulse' : task.priority === 'medium' ? 'text-orange-500' : 'text-blue-500'}`} />
                            )}
                          </div>
                        </div>

                        {/* Middle metadata indicators (Priority, Reminder, Repeat) */}
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          {task.reminderType && task.reminderType !== 'none' && (
                            <span className="text-[7.5px] font-mono bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-500 dark:text-slate-450 px-1 py-0.5 rounded flex items-center gap-0.5">
                              <Bell className="w-2 h-2" /> reminder
                            </span>
                          )}
                          {task.recurrence && (
                            <span className="text-[7.5px] font-mono bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-500 dark:text-slate-450 px-1 py-0.5 rounded flex items-center gap-0.5">
                              <Repeat className="w-2 h-2 animate-spin-slow" /> {task.recurrence.frequency}
                            </span>
                          )}
                        </div>

                        {/* Footer Goal badge */}
                        {task.goalId && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavToGoal(task.goalId);
                            }}
                            className={`text-[8px] font-semibold flex items-center gap-0.5 ${style.badge} px-1.5 py-0.5 rounded-full mt-1 w-max shrink-0 transition-transform active:scale-95 cursor-pointer`}
                          >
                            <Target className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[80px]">{task.goalTitle || 'Linked Goal'}</span>
                          </button>
                        )}

                        {/* Bottom Resize Handle */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-2 bg-transparent cursor-ns-resize flex items-center justify-center group"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleTaskMouseDown(e, task, 'resize');
                          }}
                        >
                          <div className="w-8 h-1 bg-slate-300 dark:bg-slate-700/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    );
                  })}

                  {/* High fidelity centered Empty State in Day View */}
                  {colTasks.length === 0 && calendarView === 'day' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center select-none z-20">
                      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl max-w-sm pointer-events-auto space-y-4 animate-fadeIn">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-600 mx-auto">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-850 dark:text-slate-100">
                            🎯 No tasks scheduled today
                          </h5>
                          <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1 max-w-[240px] mx-auto">
                            Keep your agenda clear or map high-performance blocks.
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5 pt-1.5">
                          <button
                            onClick={() => onSlotClick("09:00 AM", dStr)}
                            className="text-[10px] font-sans font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 hover:shadow-lg hover:shadow-cyan-500/10 active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" /> Create Task
                          </button>
                          <button
                            onClick={() => onLetAIPlan?.()}
                            className="text-[10px] font-sans font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border border-amber-500/10 active:scale-95"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Let AI Plan My Day
                          </button>
                          <button
                            onClick={() => onImportCalendar?.()}
                            className="text-[10px] font-sans font-bold text-slate-650 dark:text-slate-300 bg-slate-100 hover:bg-slate-150 dark:bg-slate-800 dark:hover:bg-slate-750 px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                          >
                            <Calendar className="w-3.5 h-3.5" /> Import Calendar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render Month Grid View
  const renderMonthGrid = () => {
    // Basic calendar month generation
    const year = new Date(activeDateStr).getFullYear();
    const month = new Date(activeDateStr).getMonth();
    const startOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = startOfMonth.getDay();

    const calendarGrid = [];
    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(prevMonthLastDay - i).padStart(2, '0')}`;
      calendarGrid.push({ dayNum: prevMonthLastDay - i, isCurrentMonth: false, dateStr: dStr });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      calendarGrid.push({ dayNum: i, isCurrentMonth: true, dateStr: dStr });
    }

    // Remaining slots to 42
    const remainingSlots = 42 - calendarGrid.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const dStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      calendarGrid.push({ dayNum: i, isCurrentMonth: false, dateStr: dStr });
    }

    return (
      <div className="bg-slate-50/50 dark:bg-slate-950/15 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 space-y-5 shadow-sm text-left">
        {/* Cleaner Weekday Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-slate-450 dark:text-slate-500 pb-3 border-b border-slate-200/40 dark:border-slate-800/50">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>

        {/* Smoother Month Transition Container */}
        <motion.div 
          key={`${year}-${month}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="grid grid-cols-7 gap-3"
        >
          {calendarGrid.map((day, idx) => {
            const isSelected = day.dateStr === activeDateStr;
            const isToday = day.dateStr === new Date().toISOString().split('T')[0];
            const dayTasks = processedTasks.filter(t => t.date === day.dateStr);
            const highPriorityTasks = dayTasks.filter(t => t.priority === 'high');

            return (
              <motion.div
                key={idx}
                whileHover={day.isCurrentMonth ? { scale: 1.025, y: -1 } : {}}
                whileTap={day.isCurrentMonth ? { scale: 0.98 } : {}}
                onClick={() => day.isCurrentMonth && setActiveDate(day.dateStr)}
                className={`min-h-[92px] p-3 border rounded-2xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden select-none group/day ${
                  !day.isCurrentMonth 
                    ? 'bg-transparent border-transparent text-slate-700 dark:text-slate-300 dark:text-slate-800 cursor-not-allowed pointer-events-none opacity-20' 
                    : isSelected 
                      ? 'bg-cyan-500/[0.06] dark:bg-[#f43f5e]/15 border-cyan-500/80 dark:border-[#f43f5e]/80 shadow-md shadow-cyan-500/5 dark:shadow-[#f43f5e]/5' 
                      : isToday
                        ? 'bg-slate-100/80 dark:bg-slate-900 border-slate-350 dark:border-slate-750 shadow-sm'
                        : 'bg-white dark:bg-slate-900/35 border-slate-200/60 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-300 dark:border-slate-700 shadow-sm hover:shadow'
                }`}
              >
                {/* Active Indicator Bar on Selection */}
                {isSelected && (
                  <motion.div 
                    layoutId="activeMonthDayIndicator"
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-[#f43f5e] dark:to-rose-500"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-mono font-bold ${
                    isSelected 
                      ? 'text-cyan-600 dark:text-[#f43f5e]' 
                      : isToday
                        ? 'text-amber-600 dark:text-amber-400 font-extrabold underline'
                        : 'text-slate-450 dark:text-slate-500'
                  }`}>
                    {day.dayNum}
                  </span>
                  
                  {day.isCurrentMonth && dayTasks.length > 0 && (
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      highPriorityTasks.length > 0 
                        ? 'bg-rose-500 animate-pulse' 
                        : 'bg-cyan-400 dark:bg-cyan-500'
                    }`} />
                  )}
                </div>

                <div className="flex flex-col gap-1 mt-2 overflow-hidden max-h-[50px]">
                  {dayTasks.slice(0, 2).map((t) => {
                    const style = getCategoryStyles(t.categoryName, t.completed);
                    return (
                      <div 
                        key={t.id} 
                        className={`text-[8px] truncate font-sans px-1.5 py-0.5 rounded-md font-bold text-left border ${style.bg} ${style.border} ${style.text}`}
                      >
                        {t.title}
                      </div>
                    );
                  })}
                  {dayTasks.length > 2 && (
                    <span className="text-[7.5px] font-mono text-slate-450 pl-1 font-semibold">
                      +{dayTasks.length - 2} more
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    );
  };

  // Render Agenda View (TickTick style list)
  const renderAgendaList = () => {
    // Sort tasks chronologically by date and time
    const sortedTasks = [...processedTasks].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
    });

    const activeDateTasks = sortedTasks.filter(t => t.date === activeDateStr);

    return (
      <div className="bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-5 space-y-4 shadow-sm text-left max-h-[600px] overflow-y-auto no-scrollbar">
        <h4 className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-500" /> Agenda for {formatDateHeader(activeDateStr)}
        </h4>

        {activeDateTasks.length === 0 ? (
          <div className="text-center py-12 space-y-4 max-w-sm mx-auto">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 mx-auto">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                🎯 No tasks scheduled today
              </h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-400 mt-1">
                Plan your day using high-performance scheduling blocks.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 pt-1">
              <button
                onClick={() => onSlotClick("09:00 AM", activeDateStr)}
                className="text-[10px] font-sans font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 hover:shadow-lg hover:shadow-cyan-500/10 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Create Task
              </button>
              <button
                onClick={() => onLetAIPlan?.()}
                className="text-[10px] font-sans font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border border-amber-500/10 active:scale-95 animate-pulse"
              >
                <Sparkles className="w-3.5 h-3.5" /> ✨ Let AI Plan My Day
              </button>
              <button
                onClick={() => onImportCalendar?.()}
                className="text-[10px] font-sans font-bold text-slate-650 dark:text-slate-300 bg-slate-150 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-755 px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5" /> 📅 Import Calendar Template
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeDateTasks.map((t) => {
              const style = getCategoryStyles(t.categoryName);
              const isDone = t.completed;
              return (
                <div 
                  key={t.id} 
                  className={`p-4 rounded-2xl border-2 backdrop-blur-md flex items-center justify-between gap-4 transition-all ${style.bg} ${style.border} ${isDone ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        const wkday = getWeekdayIdFromDate(t.date);
                        onToggleTask(wkday, t.categoryId || 'uncategorized', t.id);
                      }}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-400 bg-white/50 dark:bg-slate-900/50'}`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                    </button>

                    <div className="min-w-0">
                      <h5 className={`text-xs font-bold leading-relaxed ${style.text} ${isDone ? 'line-through' : ''}`}>
                        {t.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {t.time} ({t.duration || 60}m)
                        </span>
                        {t.goalId && (
                          <span className="text-[9px] font-sans font-semibold text-cyan-500">
                            • Goal: {t.goalTitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const wkday = getWeekdayIdFromDate(t.date);
                        onDeleteTask(wkday, t.categoryId || 'uncategorized', t.id);
                      }}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" id="high-impact-timeline-workspace">
      {/* Calendar Header / View Selector Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-200/40 dark:border-slate-800/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 dark:bg-red-500/10 text-cyan-500 dark:text-red-400 shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-mono font-bold text-[#f43f5e] uppercase tracking-widest">
              High-Performance Scheduler
            </h3>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
              AETHER.OS Fluid 60FPS Drag & Drop Timeline View
            </p>
          </div>
        </div>

        {/* Segmented View Mode Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 gap-1 select-none">
          {(['day', '3day', 'week', 'month', 'agenda'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setCalendarView(view)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${calendarView === view ? 'bg-cyan-500 text-slate-950 dark:bg-[#f43f5e] dark:text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'}`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Main rendered view */}
      {calendarView === 'month' ? renderMonthGrid() : calendarView === 'agenda' ? renderAgendaList() : renderTimelineGrid()}

      {/* --- FLOATING iOS-STYLE BOTTOM SHEET CONFLICT WARNING DIALOG --- */}
      <AnimatePresence>
        {conflictTask && (
          <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950/40 backdrop-blur-md z-50 flex items-end justify-center pointer-events-auto" onClick={() => setConflictTask(null)}>
            <motion.div
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 220 }}
              className="w-full max-w-lg bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-6 space-y-6 text-left rounded-t-[36px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag bar indicator */}
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-750 rounded-full mx-auto" />

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                    Objective Scheduling Conflict Detected
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400">
                    You are trying to map an action block during an already committed timeline slot. How would you like to resolve?
                  </p>
                </div>
              </div>

              {/* Conflict details box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-3.5">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 dark:text-slate-550 uppercase font-bold">Conflicting Blocks</span>
                  <span className="text-[10px] font-mono text-amber-500 uppercase font-bold">Overlap Alert</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 border-r border-slate-200/60 dark:border-slate-800/60 pr-2">
                    <p className="text-[9px] font-mono text-cyan-500 dark:text-cyan-400 font-bold uppercase">Candidate Block</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{conflictTask.task1.title}</p>
                    <p className="text-[10.5px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-400">{conflictTask.task1.time} ({conflictTask.task1.duration}m)</p>
                  </div>
                  <div className="space-y-1 pl-2">
                    <p className="text-[9px] font-mono text-slate-450 dark:text-slate-400 font-bold uppercase">Committed Block</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{conflictTask.task2.title}</p>
                    <p className="text-[10.5px] font-mono text-slate-500 dark:text-slate-500 dark:text-slate-400">{conflictTask.task2.time} ({conflictTask.task2.duration}m)</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    // Push anyway (keep both)
                    const wkday = getWeekdayIdFromDate(conflictTask.task1.date);
                    onUpdateTask(wkday, conflictTask.task1.categoryId || 'uncategorized', conflictTask.task1.id, {
                      time: conflictTask.task1.time,
                      endTime: conflictTask.task1.endTime,
                      duration: conflictTask.task1.duration,
                      date: conflictTask.task1.date,
                    });
                    setConflictTask(null);
                  }}
                  className="px-4 py-3 text-[11px] font-mono uppercase font-bold bg-slate-850 hover:bg-slate-100 dark:bg-slate-800 border border-slate-850 rounded-2xl text-slate-700 dark:text-slate-300 transition-all text-center cursor-pointer"
                >
                  Keep Both
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Move candidate task forward (automatically adjust start time of task 1 to end of task 2)
                    const endOfTask2Minutes = parseTimeToMinutes(conflictTask.task2.time) + (conflictTask.task2.duration || 60);
                    const shiftedTimeStr = formatMinutesToTimeStr(endOfTask2Minutes);
                    const shiftedEndTimeStr = formatMinutesToTimeStr(endOfTask2Minutes + (conflictTask.task1.duration || 60));
                    
                    const wkday = getWeekdayIdFromDate(conflictTask.task1.date);
                    onUpdateTask(wkday, conflictTask.task1.categoryId || 'uncategorized', conflictTask.task1.id, {
                      time: shiftedTimeStr,
                      endTime: shiftedEndTimeStr,
                      duration: conflictTask.task1.duration,
                      date: conflictTask.task1.date,
                    });
                    setConflictTask(null);
                  }}
                  className="px-4 py-3 text-[11px] font-mono uppercase font-bold bg-[#f43f5e]/25 hover:bg-[#f43f5e]/35 border border-[#f43f5e]/30 rounded-2xl text-red-400 transition-all text-center cursor-pointer"
                >
                  Auto Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => setConflictTask(null)}
                  className="px-4 py-3 text-[11px] font-mono uppercase font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 rounded-2xl text-white transition-all text-center cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
