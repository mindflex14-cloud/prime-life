import React, { useState } from 'react';
import { Droplets, Edit2, Moon, Plus, Minus, X, Zap, Check } from 'lucide-react';
import { RecoveryHydrationState, RecoveryActivity } from './Types';

interface Props {
  state: RecoveryHydrationState;
  setState: React.Dispatch<React.SetStateAction<RecoveryHydrationState>>;
  isDarkMode: boolean;
}

export default function RecoveryHydration({ state, setState, isDarkMode }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const toggleActivity = (id: string) => {
    setState(prev => ({
      ...prev,
      activities: prev.activities.map(a => 
        a.id === id ? { ...a, isCompleted: !a.isCompleted } : a
      )
    }));
  };

  const addWater = () => {
    setState(prev => ({
      ...prev,
      waterIntake: Math.min(prev.waterIntake + prev.bottleSize, prev.dailyWaterGoal)
    }));
  };

  const [editState, setEditState] = useState<RecoveryHydrationState | null>(null);

  const startEditing = () => {
    setEditState({ ...state });
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (editState) {
      setState(editState);
    }
    setIsEditing(false);
  };

  const handleActivityChange = (id: string, name: string) => {
    if (!editState) return;
    setEditState({
      ...editState,
      activities: editState.activities.map(a => a.id === id ? { ...a, name } : a)
    });
  };

  const addActivity = () => {
    if (!editState) return;
    setEditState({
      ...editState,
      activities: [
        ...editState.activities,
        { id: 'new-' + Date.now(), name: 'New Activity', isCompleted: false }
      ]
    });
  };

  const removeActivity = (id: string) => {
    if (!editState) return;
    setEditState({
      ...editState,
      activities: editState.activities.filter(a => a.id !== id)
    });
  };

  const waterProgress = Math.min((state.waterIntake / state.dailyWaterGoal) * 100, 100);

  if (isEditing && editState) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className={`font-sans font-bold text-lg ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Edit Recovery & Hydration</h3>
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
              Save Settings
            </button>
          </div>
        </div>
        
        <div className={`glass-panel p-6 rounded-2xl space-y-6 ${isDarkMode ? 'border-white/5 bg-slate-900/40' : 'border-slate-200 bg-white/60'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1.5">Daily Water Goal (ml)</label>
               <input 
                 type="number" 
                 value={editState.dailyWaterGoal}
                 onChange={(e) => setEditState({...editState, dailyWaterGoal: parseInt(e.target.value) || 0})}
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-colors"
               />
             </div>
             <div>
               <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1.5">Bottle Size (ml)</label>
               <input 
                 type="number" 
                 value={editState.bottleSize}
                 onChange={(e) => setEditState({...editState, bottleSize: parseInt(e.target.value) || 0})}
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-colors"
               />
             </div>
             <div>
               <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1.5">Sleep Target (hours)</label>
               <input 
                 type="number" 
                 value={editState.sleepTarget}
                 onChange={(e) => setEditState({...editState, sleepTarget: parseInt(e.target.value) || 0})}
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-colors"
               />
             </div>
             <div className="grid grid-cols-2 gap-2">
               <div>
                 <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1.5">Bedtime</label>
                 <input 
                   type="time" 
                   value={editState.bedtimeGoal}
                   onChange={(e) => setEditState({...editState, bedtimeGoal: e.target.value})}
                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-colors"
                 />
               </div>
               <div>
                 <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1.5">Wake up</label>
                 <input 
                   type="time" 
                   value={editState.wakeupGoal}
                   onChange={(e) => setEditState({...editState, wakeupGoal: e.target.value})}
                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-colors"
                 />
               </div>
             </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
             <div className="flex items-center justify-between mb-4">
               <h4 className="font-bold text-slate-200">Recovery Checklist</h4>
               <button onClick={addActivity} className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                 <Plus className="w-4 h-4" /> Add Activity
               </button>
             </div>
             <div className="space-y-2">
               {editState.activities.map(activity => (
                 <div key={activity.id} className="flex items-center gap-2">
                   <input 
                     type="text" 
                     value={activity.name}
                     onChange={(e) => handleActivityChange(activity.id, e.target.value)}
                     className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-colors"
                   />
                   <button onClick={() => removeActivity(activity.id)} className="p-2 text-slate-500 hover:text-rose-400">
                     <X className="w-5 h-5" />
                   </button>
                 </div>
               ))}
               {editState.activities.length === 0 && (
                 <p className="text-slate-500 text-sm italic">No activities added.</p>
               )}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold font-sans tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            <Droplets className="w-6 h-6 text-blue-400" />
            Recovery & Hydration
          </h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Intelligent metrics for physical restoration.</p>
        </div>
        <button 
          onClick={startEditing}
          className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hydration */}
        <div className={`glass-panel p-5 rounded-2xl relative overflow-hidden group ${isDarkMode ? 'border-white/5 bg-slate-900/60' : 'border-slate-200 bg-white/60 shadow-sm'}`}>
          <div className="absolute inset-0 bg-blue-500/5 transition-opacity opacity-0 group-hover:opacity-100" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              <h3 className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Hydration</h3>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400">{state.waterIntake} / {state.dailyWaterGoal} ml</span>
          </div>
          
          <div className={`h-3 w-full rounded-full overflow-hidden relative z-10 mb-4 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${waterProgress}%` }}
            />
          </div>

          <button 
            onClick={addWater}
            disabled={state.waterIntake >= state.dailyWaterGoal}
            className="w-full py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 font-bold text-sm transition-colors flex items-center justify-center gap-2 relative z-10 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add {state.bottleSize}ml
          </button>
        </div>

        {/* Sleep */}
        <div className={`glass-panel p-5 rounded-2xl relative overflow-hidden group ${isDarkMode ? 'border-white/5 bg-slate-900/60' : 'border-slate-200 bg-white/60 shadow-sm'}`}>
          <div className="absolute inset-0 bg-indigo-500/5 transition-opacity opacity-0 group-hover:opacity-100" />
          <div className="flex items-center justify-between mb-4 relative z-10" id="sleep-card-header">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              <h3 className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Sleep Target</h3>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400">{state.sleepDuration} / {state.sleepTarget} hrs</span>
          </div>
          
          <div className={`h-3 w-full rounded-full overflow-hidden relative z-10 mb-4 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((state.sleepDuration / Math.max(state.sleepTarget, 1)) * 100, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-sm relative z-10 mb-4 border-b pb-3 border-slate-800/40">
            <div className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
              <span className="block text-[10px] uppercase tracking-wider mb-0.5 font-mono text-slate-500">Bedtime</span>
              <span className={`font-mono font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{state.bedtimeGoal}</span>
            </div>
            <div className={`text-right ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="block text-[10px] uppercase tracking-wider mb-0.5 font-mono text-slate-500">Wake up</span>
              <span className={`font-mono font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{state.wakeupGoal}</span>
            </div>
          </div>

          {/* Daily Sleep Hours Log Controls */}
          <div className="flex items-center justify-between gap-2 mt-4 relative z-10">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 animate-pulse" /> Slept Hours Today
            </span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => {
                  setState(prev => ({ 
                    ...prev, 
                    sleepDuration: Math.max(0, parseFloat((prev.sleepDuration - 0.5).toFixed(1))) 
                  }));
                }}
                className={`p-1.5 rounded-lg transition-colors border ${
                  isDarkMode 
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-white/5' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title="Decrease 0.5 hours"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className={`text-sm font-mono font-bold px-2 w-16 text-center ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {state.sleepDuration}h
              </span>
              <button 
                onClick={() => {
                  setState(prev => ({ 
                    ...prev, 
                    sleepDuration: Math.min(24, parseFloat((prev.sleepDuration + 0.5).toFixed(1))) 
                  }));
                }}
                className={`p-1.5 rounded-lg transition-colors border ${
                  isDarkMode 
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-white/5' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title="Increase 0.5 hours"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Checklist */}
      <div className={`glass-panel p-5 rounded-2xl ${isDarkMode ? 'border-white/5 bg-slate-900/40' : 'border-slate-200 bg-white/60 shadow-sm'}`}>
        <h3 className={`font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
          <Zap className="w-4 h-4" />
          Recovery Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {state.activities.map(activity => (
            <button
              key={activity.id}
              onClick={() => toggleActivity(activity.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                activity.isCompleted 
                  ? (isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600')
                  : (isDarkMode ? 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300')
              }`}
            >
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                activity.isCompleted ? (isDarkMode ? 'bg-emerald-500 border-emerald-500' : 'bg-emerald-500 border-emerald-500') : (isDarkMode ? 'border-slate-600' : 'border-slate-300')
              }`}>
                {activity.isCompleted && <Check className={isDarkMode ? 'w-3.5 h-3.5 text-slate-950' : 'w-3.5 h-3.5 text-white'} />}
              </div>
              <span className={`text-sm font-medium ${activity.isCompleted ? 'line-through opacity-80' : ''}`}>
                {activity.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
