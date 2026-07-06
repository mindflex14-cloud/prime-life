import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Edit2, Play, CheckCircle, ChevronRight, Check, Plus, X } from 'lucide-react';
import { WorkoutTemplate, DailyWorkout, Exercise } from './Types';

interface Props {
  templates: WorkoutTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<WorkoutTemplate[]>>;
  dailyWorkout: DailyWorkout | null;
  setDailyWorkout: React.Dispatch<React.SetStateAction<DailyWorkout | null>>;
  isDarkMode: boolean;
}

export default function PhysicalActivity({ templates, setTemplates, dailyWorkout, setDailyWorkout, isDarkMode }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<WorkoutTemplate | null>(templates[0] || null);

  const getTodayWorkout = () => {
    // In a real app, map today's day to schedule. For now, use activeTemplate
    return activeTemplate;
  };

  const todayWorkout = getTodayWorkout();

  const handleSetComplete = (exerciseId: string) => {
    if (!dailyWorkout) return;
    const currentSets = dailyWorkout.completedSets[exerciseId] || 0;
    const exercise = todayWorkout?.exercises.find(e => e.id === exerciseId);
    if (!exercise || currentSets >= exercise.sets) return;

    setDailyWorkout(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        completedSets: {
          ...prev.completedSets,
          [exerciseId]: currentSets + 1
        }
      };
    });
  };

  const [editTemplate, setEditTemplate] = useState<WorkoutTemplate | null>(null);

  const startEditing = () => {
    setEditTemplate(activeTemplate ? { ...activeTemplate } : {
      id: 'new-' + Date.now(),
      name: 'New Workout',
      schedule: [],
      warmup: '',
      cooldown: '',
      exercises: []
    });
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (editTemplate) {
      setTemplates(prev => {
        const existingIndex = prev.findIndex(t => t.id === editTemplate.id);
        if (existingIndex >= 0) {
          const newArr = [...prev];
          newArr[existingIndex] = editTemplate;
          return newArr;
        } else {
          return [...prev, editTemplate];
        }
      });
      setActiveTemplate(editTemplate);
    }
    setIsEditing(false);
  };

  const handleExerciseChange = (exId: string, field: keyof Exercise, value: any) => {
    if (!editTemplate) return;
    setEditTemplate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map(e => e.id === exId ? { ...e, [field]: value } : e)
      };
    });
  };

  const addExercise = () => {
    if (!editTemplate) return;
    setEditTemplate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            id: 'ex-' + Date.now(),
            name: 'New Exercise',
            sets: 3,
            reps: 10,
            targetWeight: 0,
            restTime: 60,
            order: prev.exercises.length + 1,
            notes: ''
          }
        ]
      };
    });
  };

  const removeExercise = (exId: string) => {
    if (!editTemplate) return;
    setEditTemplate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.filter(e => e.id !== exId)
      };
    });
  };

  const renderEditMode = () => {
    if (!editTemplate) return null;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className={`font-sans font-bold text-lg ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Edit Workout Plan</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              className={`px-4 py-2 font-bold rounded-xl text-sm transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'}`}
            >
              Cancel
            </button>
            <button 
              onClick={saveEdit}
              className={`px-4 py-2 font-bold rounded-xl text-sm transition-all ${isDarkMode ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
            >
              Save Plan
            </button>
          </div>
        </div>
        
        <div className={`glass-panel p-6 rounded-2xl space-y-4 ${isDarkMode ? 'border-white/5 bg-slate-900/40' : 'border-slate-200 bg-white/60'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1.5">Workout Split / Name</label>
               <input 
                 type="text" 
                 value={editTemplate.name}
                 onChange={(e) => setEditTemplate(prev => prev ? {...prev, name: e.target.value} : prev)}
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-colors"
               />
             </div>
             <div>
               <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1.5">Schedule (e.g. Mon, Wed, Fri)</label>
               <input 
                 type="text" 
                 value={editTemplate.schedule.join(', ')}
                 onChange={(e) => setEditTemplate(prev => prev ? {...prev, schedule: e.target.value.split(',').map(s => s.trim())} : prev)}
                 placeholder="Monday, Wednesday..."
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-colors"
               />
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1.5">Warm-up Protocol</label>
               <textarea 
                 value={editTemplate.warmup}
                 onChange={(e) => setEditTemplate(prev => prev ? {...prev, warmup: e.target.value} : prev)}
                 rows={2}
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-colors"
               />
            </div>
            <div>
               <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1.5">Cool-down Protocol</label>
               <textarea 
                 value={editTemplate.cooldown}
                 onChange={(e) => setEditTemplate(prev => prev ? {...prev, cooldown: e.target.value} : prev)}
                 rows={2}
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-colors"
               />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
             <div className="flex items-center justify-between mb-4">
               <h4 className="font-bold text-slate-200">Exercises</h4>
               <button onClick={addExercise} className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                 <Plus className="w-4 h-4" /> Add Exercise
               </button>
             </div>
             
             <div className="space-y-3">
               {editTemplate.exercises.map((ex, index) => (
                 <div key={ex.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-3 relative group">
                   <button onClick={() => removeExercise(ex.id)} className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                     <X className="w-4 h-4" />
                   </button>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                     <div className="lg:col-span-2">
                       <label className="text-[10px] uppercase text-slate-500 block mb-1">Exercise Name</label>
                       <input 
                         type="text" 
                         value={ex.name}
                         onChange={(e) => handleExerciseChange(ex.id, 'name', e.target.value)}
                         className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                       />
                     </div>
                     <div>
                       <label className="text-[10px] uppercase text-slate-500 block mb-1">Sets</label>
                       <input 
                         type="number" 
                         value={ex.sets}
                         onChange={(e) => handleExerciseChange(ex.id, 'sets', parseInt(e.target.value) || 0)}
                         className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                       />
                     </div>
                     <div>
                       <label className="text-[10px] uppercase text-slate-500 block mb-1">Reps</label>
                       <input 
                         type="number" 
                         value={ex.reps}
                         onChange={(e) => handleExerciseChange(ex.id, 'reps', parseInt(e.target.value) || 0)}
                         className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                       />
                     </div>
                     <div>
                       <label className="text-[10px] uppercase text-slate-500 block mb-1">Weight (lbs/kg)</label>
                       <input 
                         type="number" 
                         value={ex.targetWeight}
                         onChange={(e) => handleExerciseChange(ex.id, 'targetWeight', parseInt(e.target.value) || 0)}
                         className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                       />
                     </div>
                     <div>
                       <label className="text-[10px] uppercase text-slate-500 block mb-1">Rest (sec)</label>
                       <input 
                         type="number" 
                         value={ex.restTime}
                         onChange={(e) => handleExerciseChange(ex.id, 'restTime', parseInt(e.target.value) || 0)}
                         className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                       />
                     </div>
                     <div className="lg:col-span-2">
                       <label className="text-[10px] uppercase text-slate-500 block mb-1">Notes</label>
                       <input 
                         type="text" 
                         value={ex.notes}
                         onChange={(e) => handleExerciseChange(ex.id, 'notes', e.target.value)}
                         className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                       />
                     </div>
                   </div>
                 </div>
               ))}
               {editTemplate.exercises.length === 0 && (
                 <p className="text-slate-500 text-sm italic">No exercises added yet.</p>
               )}
             </div>
          </div>
        </div>
      </div>
    );
  };

  if (isEditing) return renderEditMode();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold font-sans tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            <Activity className="w-6 h-6 text-cyan-400" />
            Physical Activity
          </h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Intelligent workout planner & real-time tracking.</p>
        </div>
        <button 
          onClick={startEditing}
          className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {!todayWorkout ? (
        <div className={`glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center border-dashed ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <Activity className={`w-6 h-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          </div>
          <p className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>No workout scheduled for today.</p>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Take a rest day or configure a new split.</p>
        </div>
      ) : (
        <div className={`glass-panel p-6 rounded-2xl flex flex-col gap-6 ${isDarkMode ? 'border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-950' : 'border-slate-200 bg-white/60'}`}>
          <div className={`flex items-center justify-between border-b pb-4 ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
            <div>
              <span className="text-xs font-mono font-bold text-cyan-500 tracking-wider uppercase mb-1 block">Today's Protocol</span>
              <h3 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{todayWorkout.name}</h3>
            </div>
            {/* Progress Circle (Simplified) */}
            <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 flex items-center justify-center relative">
              <span className="text-xs font-mono font-bold text-cyan-400">0%</span>
            </div>
          </div>

          <div className="space-y-3">
            {todayWorkout.exercises.map(exercise => {
              const completed = dailyWorkout?.completedSets[exercise.id] || 0;
              const isDone = completed >= exercise.sets;

              return (
                <div key={exercise.id} className={`p-4 rounded-xl border transition-colors flex items-center justify-between ${isDone ? (isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200') : (isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200')}`}>
                  <div>
                    <h4 className={`font-bold ${isDone ? 'text-emerald-400 line-through opacity-70' : (isDarkMode ? 'text-slate-200' : 'text-slate-800')}`}>{exercise.name}</h4>
                    <p className={`text-xs font-mono mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {exercise.sets} SETS × {exercise.reps} REPS | {exercise.targetWeight} LB
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500 mr-2">{completed} / {exercise.sets}</span>
                    <button 
                      onClick={() => handleSetComplete(exercise.id)}
                      disabled={isDone}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDone ? (isDarkMode ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-500 text-white') : (isDarkMode ? 'bg-slate-700 hover:bg-cyan-500 hover:text-slate-950 text-slate-300' : 'bg-slate-200 hover:bg-cyan-500 hover:text-white text-slate-600')}`}
                    >
                      {isDone ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${isDarkMode ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950' : 'bg-cyan-500 hover:bg-cyan-600 text-white'}`}>
            <CheckCircle className="w-5 h-5" />
            Complete Workout
          </button>
        </div>
      )}
    </div>
  );
}
