import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Edit2, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Check, 
  Plus, 
  X, 
  Trash2, 
  PlusCircle, 
  Flame, 
  Clock, 
  Dumbbell 
} from 'lucide-react';
import { WorkoutTemplate, DailyWorkout, Exercise, MuscleGroupSection } from './Types';

interface Props {
  templates: WorkoutTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<WorkoutTemplate[]>>;
  dailyWorkout: DailyWorkout | null;
  setDailyWorkout: (workout: DailyWorkout | null) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  isDarkMode: boolean;
  onUpdateWorkout: (workout: DailyWorkout) => void;
  onDeleteWorkout: () => void;
  workoutHistory: Record<string, DailyWorkout>;
  setWorkoutHistory: React.Dispatch<React.SetStateAction<Record<string, DailyWorkout>>>;
}

export default function PhysicalActivity({ 
  templates, 
  setTemplates, 
  dailyWorkout, 
  setDailyWorkout, 
  selectedDate, 
  setSelectedDate, 
  isDarkMode,
  onUpdateWorkout,
  onDeleteWorkout,
  workoutHistory,
  setWorkoutHistory
}: Props) {
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  
  // Local state for template editing form
  const [editTemplate, setEditTemplate] = useState<WorkoutTemplate | null>(null);

  // Local state for exercise editing form
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editExName, setEditExName] = useState('');
  const [editExSets, setEditExSets] = useState(3);
  const [editExReps, setEditExReps] = useState(10);

  // Local state for monthly calendar view
  const [showMonthCalendar, setShowMonthCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(selectedDate));

  // Date utilities
  const dateStr = selectedDate.toISOString().split('T')[0];

  // Generate 7 days centered on selectedDate for the local day selector strip
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

  // Helper to generate calendar grid for a specific month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 Sunday, 1 Monday...
    
    const calendarDays = [];
    
    // Padding for days before the 1st of month
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      calendarDays.push(new Date(year, month, d));
    }
    
    return calendarDays;
  };

  // Save changes to exercise and propagate to future dates and templates
  const handleSaveExercise = (sectionId: string, exerciseId: string) => {
    if (!dailyWorkout) return;

    const currentDayStr = selectedDate.toISOString().split('T')[0];

    // 1. Update the exercise on the current day's workout
    const updatedSectionsForCurrent = dailyWorkout.sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          exercises: sec.exercises.map(ex => {
            if (ex.id === exerciseId) {
              return {
                ...ex,
                name: editExName.trim(),
                sets: editExSets,
                reps: editExReps
              };
            }
            return ex;
          })
        };
      }
      return sec;
    });

    const updatedCurrentWorkout: DailyWorkout = {
      ...dailyWorkout,
      sections: updatedSectionsForCurrent
    };

    // Trigger update for current workout
    onUpdateWorkout(updatedCurrentWorkout);

    // 2. Propagate to future days in workoutHistory (from currentDayStr onwards)
    setWorkoutHistory(prevHistory => {
      const updatedHistory = { ...prevHistory };
      
      // Update the current day in history as well to ensure perfect consistency
      updatedHistory[currentDayStr] = updatedCurrentWorkout;

      // Iterate through all stored days
      Object.keys(updatedHistory).forEach(dateKey => {
        if (dateKey > currentDayStr) {
          const workout = updatedHistory[dateKey];
          if (workout && workout.templateId === dailyWorkout.templateId) {
            const nextSections = workout.sections.map(sec => {
              const hasExercise = sec.exercises.some(ex => ex.id === exerciseId);
              if (hasExercise) {
                return {
                  ...sec,
                  exercises: sec.exercises.map(ex => {
                    if (ex.id === exerciseId) {
                      return {
                        ...ex,
                        name: editExName.trim(),
                        sets: editExSets,
                        reps: editExReps
                      };
                    }
                    return ex;
                  })
                };
              }
              return sec;
            });

            updatedHistory[dateKey] = {
              ...workout,
              sections: nextSections
            };
          }
        }
      });

      return updatedHistory;
    });

    // 3. Update the templates, so future auto-initializations carry this change forward!
    setTemplates(prevTemplates => {
      return prevTemplates.map(t => {
        if (t.id === dailyWorkout.templateId) {
          return {
            ...t,
            sections: t.sections.map(sec => {
              const hasExercise = sec.exercises.some(ex => ex.id === exerciseId);
              if (hasExercise) {
                return {
                  ...sec,
                  exercises: sec.exercises.map(ex => {
                    if (ex.id === exerciseId) {
                      return {
                        ...ex,
                        name: editExName.trim(),
                        sets: editExSets,
                        reps: editExReps
                      };
                    }
                    return ex;
                  })
                };
              }
              return sec;
            })
          };
        }
        return t;
      });
    });

    // Reset editing state
    setEditingExerciseId(null);
  };

  // Progress calculations
  const getProgress = () => {
    if (!dailyWorkout || dailyWorkout.sections.length === 0) return 0;
    let totalSets = 0;
    let completedSetsCount = 0;
    dailyWorkout.sections.forEach(sec => {
      sec.exercises.forEach(ex => {
        totalSets += ex.sets;
        completedSetsCount += Math.min(dailyWorkout.completedSets[ex.id] || 0, ex.sets);
      });
    });
    if (totalSets === 0) return 0;
    return Math.round((completedSetsCount / totalSets) * 100);
  };

  const progressPercent = getProgress();

  // Increment completed sets (mark)
  const handleSetComplete = (exerciseId: string, maxSets: number) => {
    if (!dailyWorkout) return;
    const current = dailyWorkout.completedSets[exerciseId] || 0;
    if (current >= maxSets) return;

    const updatedSets = {
      ...dailyWorkout.completedSets,
      [exerciseId]: current + 1
    };

    // Check if everything is complete
    let isAllDone = true;
    dailyWorkout.sections.forEach(sec => {
      sec.exercises.forEach(ex => {
        const comp = ex.id === exerciseId ? current + 1 : (dailyWorkout.completedSets[ex.id] || 0);
        if (comp < ex.sets) {
          isAllDone = false;
        }
      });
    });

    onUpdateWorkout({
      ...dailyWorkout,
      completedSets: updatedSets,
      isCompleted: isAllDone
    });
  };

  // Decrement completed sets (unmark)
  const handleSetDecrement = (exerciseId: string) => {
    if (!dailyWorkout) return;
    const current = dailyWorkout.completedSets[exerciseId] || 0;
    if (current <= 0) return;

    const updatedSets = {
      ...dailyWorkout.completedSets,
      [exerciseId]: current - 1
    };

    onUpdateWorkout({
      ...dailyWorkout,
      completedSets: updatedSets,
      isCompleted: false // Mark uncompleted since we decremented a set
    });
  };

  // Reset entire exercise sets to 0 (full unmark)
  const handleSetReset = (exerciseId: string) => {
    if (!dailyWorkout) return;
    const updatedSets = {
      ...dailyWorkout.completedSets,
      [exerciseId]: 0
    };
    onUpdateWorkout({
      ...dailyWorkout,
      completedSets: updatedSets,
      isCompleted: false
    });
  };

  // Delete exercise
  const handleDeleteExercise = (sectionId: string, exerciseId: string) => {
    if (!dailyWorkout) return;
    const updatedSections = dailyWorkout.sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          exercises: sec.exercises.filter(ex => ex.id !== exerciseId)
        };
      }
      return sec;
    });

    onUpdateWorkout({
      ...dailyWorkout,
      sections: updatedSections
    });
  };

  // Add exercise
  const handleAddExercise = (sectionId: string) => {
    if (!dailyWorkout) return;
    const newExercise: Exercise = {
      id: 'ex-' + Date.now(),
      name: 'New Exercise',
      sets: 3,
      reps: 10,
      targetWeight: 0,
      restTime: 60,
      order: 1,
      notes: ''
    };

    const updatedSections = dailyWorkout.sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          exercises: [...sec.exercises, newExercise]
        };
      }
      return sec;
    });

    onUpdateWorkout({
      ...dailyWorkout,
      sections: updatedSections
    });
  };

  // Add new sub-section (muscle group)
  const [newSectionName, setNewSectionName] = useState('');
  const [showAddSectionInput, setShowAddSectionInput] = useState(false);

  const handleAddSection = () => {
    if (!dailyWorkout || !newSectionName.trim()) return;
    const newSec: MuscleGroupSection = {
      id: 'sec-' + Date.now(),
      name: newSectionName.trim(),
      exercises: []
    };

    onUpdateWorkout({
      ...dailyWorkout,
      sections: [...dailyWorkout.sections, newSec]
    });
    setNewSectionName('');
    setShowAddSectionInput(false);
  };

  // Delete sub-section (muscle group)
  const handleDeleteSection = (sectionId: string) => {
    if (!dailyWorkout) return;
    const updatedSections = dailyWorkout.sections.filter(sec => sec.id !== sectionId);
    onUpdateWorkout({
      ...dailyWorkout,
      sections: updatedSections
    });
  };

  // Complete workout manual toggle
  const handleToggleCompleteWorkout = () => {
    if (!dailyWorkout) return;
    onUpdateWorkout({
      ...dailyWorkout,
      isCompleted: !dailyWorkout.isCompleted
    });
  };

  // Manual trigger to load a template if rest day
  const handleLoadProtocol = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const clonedSections = template.sections.map(sec => ({
      ...sec,
      exercises: sec.exercises.map(ex => ({ ...ex }))
    }));

    const newDaily: DailyWorkout = {
      date: dateStr,
      templateId: template.id,
      sections: clonedSections,
      completedSets: {},
      isCompleted: false
    };

    onUpdateWorkout(newDaily);
  };

  // Edit Template Blueprint definitions
  const startEditingTemplate = (t: WorkoutTemplate) => {
    setEditTemplate(JSON.parse(JSON.stringify(t))); // deep clone
    setEditingTemplateId(t.id);
    setIsEditingTemplate(true);
  };

  const saveTemplateEdit = () => {
    if (!editTemplate) return;
    setTemplates(prev => prev.map(t => t.id === editTemplate.id ? editTemplate : t));
    setIsEditingTemplate(false);
    setEditTemplate(null);
  };

  return (
    <div className="space-y-6" id="physical-activity-component">
      {/* Title Header with Edit Template Option */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold font-sans tracking-tight flex items-center gap-2.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            <Dumbbell className="w-6 h-6 text-cyan-400 animate-pulse" />
            Apex Physical Output
          </h2>
          <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            High-leverage physical performance tracking and workout routine architect.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => startEditingTemplate(t)}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-cyan-500/30' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-cyan-300 shadow-xs'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5 text-cyan-500" />
              Edit {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* COMPACT COMPONENT-LEVEL DATE SELECTOR */}
      <div className={`p-4 rounded-2xl border ${
        isDarkMode ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50/50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Quick-Jump Protocol Date</span>
            <button 
              onClick={() => {
                setShowMonthCalendar(!showMonthCalendar);
                setCalendarMonth(new Date(selectedDate));
              }}
              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors flex items-center gap-1 uppercase ${
                showMonthCalendar 
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 font-bold' 
                  : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-cyan-600')
              }`}
              title="Toggle Monthly Calendar View"
            >
              <Clock className="w-3 h-3" />
              {showMonthCalendar ? 'Weekly View' : 'Monthly View'}
            </button>
          </div>
          <span className="text-xs font-semibold text-cyan-500 font-mono">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {showMonthCalendar ? (
          <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-3">
            {/* Calendar Month Selector Header */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => {
                  const prev = new Date(calendarMonth);
                  prev.setMonth(prev.getMonth() - 1);
                  setCalendarMonth(prev);
                }}
                className={`p-1.5 rounded border transition-all ${
                  isDarkMode ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-cyan-400' : 'border-slate-200 bg-white text-slate-600 hover:text-cyan-600'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              
              <button 
                onClick={() => {
                  const next = new Date(calendarMonth);
                  next.setMonth(next.getMonth() + 1);
                  setCalendarMonth(next);
                }}
                className={`p-1.5 rounded border transition-all ${
                  isDarkMode ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-cyan-400' : 'border-slate-200 bg-white text-slate-600 hover:text-cyan-600'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 text-center text-[10px] font-mono text-slate-500 font-bold">
              {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            {/* Grid of days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(calendarMonth).map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }

                const dateString = day.toISOString().split('T')[0];
                const isSelected = day.toDateString() === selectedDate.toDateString();
                const isToday = day.toDateString() === new Date().toDateString();
                const dayWorkout = workoutHistory[dateString];
                const isWorkoutDone = dayWorkout?.isCompleted;
                const hasWorkout = !!dayWorkout;

                return (
                  <button
                    key={`day-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedDate(day);
                    }}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-between p-1 text-xs relative transition-all border ${
                      isSelected
                        ? isDarkMode 
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 font-extrabold scale-105' 
                          : 'bg-cyan-100 border-cyan-300 text-cyan-800 font-extrabold'
                        : isDarkMode
                          ? 'bg-slate-950/80 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                          : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {/* Tiny workout status dot */}
                    <div className="absolute top-1 right-1 flex gap-0.5">
                      {isWorkoutDone ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Completed" />
                      ) : hasWorkout ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Scheduled / In Progress" />
                      ) : null}
                    </div>

                    <span className="mt-1 font-semibold">{day.getDate()}</span>

                    {isToday && (
                      <span className="text-[8px] font-mono font-bold text-cyan-400 scale-90 uppercase leading-none pb-0.5">Today</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto">
            <button 
              onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 md:gap-3 overflow-x-auto py-1">
              {weekDates.map((date, i) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all min-w-[50px] ${
                      isSelected 
                        ? isDarkMode ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold scale-[1.02]' : 'bg-cyan-100/60 border border-cyan-300 text-cyan-700 font-bold'
                        : isDarkMode ? 'hover:bg-slate-900 border border-transparent text-slate-400' : 'hover:bg-slate-200/50 border border-transparent text-slate-600'
                    }`}
                  >
                    <span className="text-[9px] font-mono uppercase opacity-70">
                      {date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 2)}
                    </span>
                    <span className="text-sm font-semibold mt-0.5">
                      {date.getDate()}
                    </span>
                    {isToday && (
                      <div className="w-1 h-1 rounded-full bg-cyan-400 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* TEMPLATE BLUEPRINT EDITOR IN-LINE OVERLAY */}
      {isEditingTemplate && editTemplate && (
        <div className={`p-6 rounded-2xl border space-y-6 ${
          isDarkMode ? 'bg-slate-900/90 border-white/10' : 'bg-slate-100 border-slate-300'
        } shadow-xl animate-fadeIn`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-cyan-400" />
              Blueprint: {editTemplate.name}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditingTemplate(false)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button 
                onClick={saveTemplateEdit}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950"
              >
                Save Blueprint
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">Schedule Days</label>
              <input 
                type="text"
                value={editTemplate.schedule.join(', ')}
                onChange={e => setEditTemplate({ ...editTemplate, schedule: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:border-cyan-500 outline-none"
                placeholder="e.g. Monday, Wednesday"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">Warm-Up</label>
              <input 
                type="text"
                value={editTemplate.warmup}
                onChange={e => setEditTemplate({ ...editTemplate, warmup: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:border-cyan-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TODAY'S WORKOUT PROTOCOL VIEW */}
      {!dailyWorkout || dailyWorkout.sections.length === 0 ? (
        <div className={`glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center border-dashed ${
          isDarkMode ? 'border-slate-800 bg-slate-950/20' : 'border-slate-300 bg-slate-50/50'
        }`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
            isDarkMode ? 'bg-slate-900' : 'bg-slate-100'
          }`}>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <p className={`font-semibold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>No Active Physical Protocol</p>
          <p className="text-xs text-slate-500 mt-1">This date is currently logged as a Physiological Rest & Recovery day.</p>
          
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => handleLoadProtocol(t.id)}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Initialize: {t.name}
              </button>
            ))}
            <button
              onClick={() => {
                const newDaily: DailyWorkout = {
                  date: dateStr,
                  templateId: 'custom',
                  sections: [
                    { id: 'custom-sec', name: 'Primary Muscle Group', exercises: [] }
                  ],
                  completedSets: {},
                  isCompleted: false
                };
                onUpdateWorkout(newDaily);
              }}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              Start Empty Routine
            </button>
          </div>
        </div>
      ) : (
        <div className={`glass-panel p-6 rounded-2xl flex flex-col gap-6 ${
          isDarkMode ? 'border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-950' : 'border-slate-200 bg-white/60 shadow-sm'
        }`}>
          {/* Header row with split name and progress gauge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-cyan-500 tracking-wider uppercase block mb-0.5">Active Routine</span>
              <h3 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {templates.find(t => t.id === dailyWorkout.templateId)?.name || 'Custom Focus Workout'}
              </h3>
              
              {/* Routine switcher buttons inline */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mr-1">Finalize Routine:</span>
                {templates.map(t => {
                  const isActive = t.id === dailyWorkout.templateId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleLoadProtocol(t.id)}
                      className={`text-[9.5px] font-mono px-2 py-1 rounded-lg border transition-all ${
                        isActive 
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 font-bold shadow-xs' 
                          : (isDarkMode ? 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-cyan-600 hover:border-cyan-300')
                      }`}
                      title={`Finalize ${t.name} from this day onwards`}
                    >
                      {t.name}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    const newDaily: DailyWorkout = {
                      date: dateStr,
                      templateId: 'rest',
                      sections: [],
                      completedSets: {},
                      isCompleted: false
                    };
                    onUpdateWorkout(newDaily);
                  }}
                  className={`text-[9.5px] font-mono px-2 py-1 rounded-lg border transition-all ${
                    dailyWorkout.templateId === 'rest' || dailyWorkout.sections.length === 0
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 font-bold shadow-xs' 
                      : (isDarkMode ? 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-rose-400 hover:border-rose-500/30' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300')
                  }`}
                  title="Finalize Rest/Recovery Day from this day onwards"
                >
                  Rest Day
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Progress gauge */}
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Sets Done</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">{progressPercent}%</span>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 flex items-center justify-center relative">
                <div 
                  className="absolute inset-0 rounded-full border-2 border-cyan-400 transition-all duration-300"
                  style={{ clipPath: `polygon(50% 50%, -50% -50%, ${progressPercent >= 25 ? '150% -50%' : '50% -50%'}, ${progressPercent >= 50 ? '150% 150%' : '50% -50%'}, ${progressPercent >= 75 ? '-50% 150%' : '50% -50%'}, -50% -50%)` }}
                />
                <Flame className={`w-5 h-5 ${progressPercent === 100 ? 'text-cyan-400' : 'text-slate-500'}`} />
              </div>
            </div>
          </div>

          {/* Sub-sections / Muscle Groups list */}
          <div className="space-y-6">
            {dailyWorkout.sections.map(section => (
              <div 
                key={section.id} 
                className={`p-4 rounded-xl border ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50/50 border-slate-200'
                } space-y-4`}
              >
                {/* Muscle Group Title row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-cyan-500 rounded-full" />
                    <input 
                      type="text"
                      value={section.name}
                      onChange={e => {
                        const updated = dailyWorkout.sections.map(s => s.id === section.id ? { ...s, name: e.target.value } : s);
                        onUpdateWorkout({ ...dailyWorkout, sections: updated });
                      }}
                      className={`font-bold bg-transparent border-b border-transparent focus:border-cyan-500/50 outline-none px-1 py-0.5 text-sm ${
                        isDarkMode ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    />
                  </div>
                  <button 
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete entire sub-section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Exercises in this Sub-section */}
                <div className="space-y-2">
                  {section.exercises.map(exercise => {
                    const completed = dailyWorkout.completedSets[exercise.id] || 0;
                    const isDone = completed >= exercise.sets;
                    const isEditingThis = editingExerciseId === exercise.id;

                    if (isEditingThis) {
                      return (
                        <div 
                          key={exercise.id} 
                          className={`p-4 rounded-xl border transition-all flex flex-col gap-3 ${
                            isDarkMode 
                              ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-500/5' 
                              : 'bg-white border-cyan-400 shadow-md'
                          }`}
                        >
                          <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">Editing Exercise</span>
                            
                            <div>
                              <label className="text-[10px] font-mono text-slate-400 block mb-1">Name of Exercise</label>
                              <input 
                                type="text"
                                value={editExName}
                                onChange={e => setEditExName(e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${
                                  isDarkMode 
                                    ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-cyan-500' 
                                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-500'
                                }`}
                                placeholder="Exercise name"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-mono text-slate-400 block mb-1">Sets</label>
                                <input 
                                  type="number"
                                  value={editExSets}
                                  onChange={e => setEditExSets(Math.max(1, parseInt(e.target.value) || 1))}
                                  className={`w-full border rounded-lg px-3 py-2 text-sm text-center outline-none transition-colors ${
                                    isDarkMode 
                                      ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-cyan-500' 
                                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-500'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-mono text-slate-400 block mb-1">Reps</label>
                                <input 
                                  type="number"
                                  value={editExReps}
                                  onChange={e => setEditExReps(Math.max(1, parseInt(e.target.value) || 1))}
                                  className={`w-full border rounded-lg px-3 py-2 text-sm text-center outline-none transition-colors ${
                                    isDarkMode 
                                      ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-cyan-500' 
                                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-500'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 mt-1">
                            <button 
                              onClick={() => setEditingExerciseId(null)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleSaveExercise(section.id, exercise.id)}
                              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                            >
                              Save Option
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={exercise.id} 
                        className={`p-3 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isDone 
                            ? isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200' 
                            : isDarkMode ? 'bg-slate-900/60 border-slate-800/50 hover:border-slate-700' : 'bg-white border-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-semibold text-sm ${
                              isDone ? 'text-emerald-500 line-through opacity-70' : (isDarkMode ? 'text-slate-200' : 'text-slate-800')
                            }`}>
                              {exercise.name}
                            </span>
                            
                            <button 
                              onClick={() => {
                                setEditingExerciseId(exercise.id);
                                setEditExName(exercise.name);
                                setEditExSets(exercise.sets);
                                setEditExReps(exercise.reps);
                              }}
                              className="p-1 text-slate-500 hover:text-cyan-400 transition-colors"
                              title="Edit exercise"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button 
                              onClick={() => handleDeleteExercise(section.id, exercise.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Delete exercise"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 px-1 flex-wrap text-xs text-slate-400 font-mono">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isDarkMode ? 'bg-slate-850 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                              {exercise.sets} SETS
                            </span>
                            <span>×</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isDarkMode ? 'bg-slate-850 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                              {exercise.reps} REPS
                            </span>
                            {exercise.targetWeight > 0 && (
                              <>
                                <span>|</span>
                                <span className="text-cyan-400 font-bold">
                                  {exercise.targetWeight} LB
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Set Complete Counters with Unmark minus button */}
                        <div className="flex items-center gap-2">
                          {completed > 0 && (
                            <button 
                              onClick={() => handleSetDecrement(exercise.id)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                isDarkMode 
                                  ? 'bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400' 
                                  : 'bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-600'
                              }`}
                              title="Decrement completed set (Unmark)"
                            >
                              <span className="text-base font-bold">-</span>
                            </button>
                          )}
                          
                          <span 
                            className="text-xs font-mono font-bold text-slate-400 mx-1.5 cursor-pointer hover:text-rose-400"
                            onClick={() => handleSetReset(exercise.id)}
                            title="Reset all sets"
                          >
                            {completed} / {exercise.sets}
                          </span>

                          <button 
                            onClick={() => handleSetComplete(exercise.id, exercise.sets)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                              isDone 
                                ? (isDarkMode ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-500 text-white') 
                                : (isDarkMode ? 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300' : 'bg-slate-200 hover:bg-cyan-500 hover:text-white text-slate-600')
                            }`}
                            title={isDone ? "All Sets Completed!" : "Complete Set"}
                          >
                            {isDone ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {section.exercises.length === 0 && (
                    <p className="text-xs text-slate-500 italic py-2">No exercises added to this muscle split. Tap below to build one.</p>
                  )}
                </div>

                {/* Sub-section add exercise trigger */}
                <button 
                  onClick={() => handleAddExercise(section.id)}
                  className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-dashed ${
                    isDarkMode 
                      ? 'border-slate-800 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400' 
                      : 'border-slate-300 hover:border-cyan-400 text-slate-500 hover:text-cyan-600'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Add Exercise to Split
                </button>
              </div>
            ))}
          </div>

          {/* Sub-Section Adder & Delete Whole Routine panel */}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/60">
            {showAddSectionInput ? (
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="e.g. Arms & Core, Cardio"
                  value={newSectionName}
                  onChange={e => setNewSectionName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSection()}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 outline-none"
                />
                <button 
                  onClick={handleAddSection}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                >
                  Add
                </button>
                <button 
                  onClick={() => setShowAddSectionInput(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAddSectionInput(true)}
                className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 bg-slate-950/40 hover:bg-slate-900 border border-slate-800 text-slate-300"
              >
                <Plus className="w-4 h-4" /> Add Muscle Sub-Section
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <button 
                onClick={onDeleteWorkout}
                className={`py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border ${
                  isDarkMode 
                    ? 'border-rose-500/20 hover:bg-rose-500/10 text-rose-400' 
                    : 'border-rose-300 hover:bg-rose-50 text-rose-700'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Clear Workout / rest day
              </button>

              <button 
                onClick={handleToggleCompleteWorkout}
                className={`py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                  dailyWorkout.isCompleted 
                    ? (isDarkMode ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-700') 
                    : (isDarkMode ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950' : 'bg-cyan-500 hover:bg-cyan-600 text-white')
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {dailyWorkout.isCompleted ? "Protocol Completed (Marked)" : "Mark Workout Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
