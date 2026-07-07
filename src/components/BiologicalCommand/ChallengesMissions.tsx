import React, { useState } from 'react';
import { Target, Edit2, Award, Flame, Star, Plus, X, Minus, Zap, Activity, Trophy, Heart } from 'lucide-react';
import { Challenge, GamificationState } from './Types';

interface Props {
  challenges: Challenge[];
  setChallenges: (challenges: Challenge[]) => void;
  gamification: GamificationState;
  setGamification?: React.Dispatch<React.SetStateAction<GamificationState>>;
  isDarkMode: boolean;
}

const IconMap: Record<string, React.ComponentType<any>> = {
  zap: Zap,
  activity: Activity,
  target: Target,
  trophy: Trophy,
  heart: Heart,
};

export default function ChallengesMissions({ challenges, setChallenges, gamification, isDarkMode }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const [editChallenges, setEditChallenges] = useState<Challenge[] | null>(null);

  const startEditing = () => {
    setEditChallenges([...challenges]);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (editChallenges) {
      setChallenges(editChallenges);
    }
    setIsEditing(false);
  };

  const updateChallenge = (id: string, field: keyof Challenge, value: any) => {
    if (!editChallenges) return;
    setEditChallenges(prev => 
      prev!.map(c => c.id === id ? { ...c, [field]: value } : c)
    );
  };

  const addChallenge = () => {
    if (!editChallenges) return;
    setEditChallenges(prev => [
      ...prev!,
      {
        id: 'new-c-' + Date.now(),
        name: 'New Challenge',
        goalType: 'daily',
        targetValue: 100,
        currentValue: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        icon: 'target',
        color: '#06b6d4'
      }
    ]);
  };

  const removeChallenge = (id: string) => {
    if (!editChallenges) return;
    setEditChallenges(prev => prev!.filter(c => c.id !== id));
  };

  if (isEditing && editChallenges) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className={`font-sans font-bold text-lg ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Edit Challenges & Missions</h3>
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
              Save Missions
            </button>
          </div>
        </div>
        
        <div className={`glass-panel p-6 rounded-2xl space-y-4 ${isDarkMode ? 'border-white/5 bg-slate-900/40' : 'border-slate-200 bg-white/60'}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-200">Active Missions</h4>
            <button onClick={addChallenge} className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Mission
            </button>
          </div>
          
          <div className="space-y-4">
            {editChallenges.map(c => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-3 relative group">
                <button onClick={() => removeChallenge(c.id)} className="absolute top-2 right-2 p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-2">
                    <label className="text-[10px] uppercase text-slate-500 block mb-1">Mission Name</label>
                    <input 
                      type="text" 
                      value={c.name}
                      onChange={(e) => updateChallenge(c.id, 'name', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 block mb-1">Goal Type</label>
                    <select 
                      value={c.goalType}
                      onChange={(e) => updateChallenge(c.id, 'goalType', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 block mb-1">Target Value</label>
                    <input 
                      type="number" 
                      value={c.targetValue}
                      onChange={(e) => updateChallenge(c.id, 'targetValue', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 block mb-1">Current Progress</label>
                    <input 
                      type="number" 
                      value={c.currentValue}
                      onChange={(e) => updateChallenge(c.id, 'currentValue', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-slate-500 block mb-1">Theme Color</label>
                    <input 
                      type="color" 
                      value={c.color}
                      onChange={(e) => updateChallenge(c.id, 'color', e.target.value)}
                      className="w-full h-[34px] bg-slate-900 border border-slate-800 rounded-lg px-1 py-1 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))}
            {editChallenges.length === 0 && (
              <p className="text-slate-500 text-sm italic">No challenges active.</p>
            )}
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
            <Target className="w-6 h-6 text-rose-400" />
            Daily Missions & Performance Goals
          </h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Gamified performance goals and streaks tracked daily.</p>
        </div>
        <button 
          onClick={startEditing}
          className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* Gamification Header */}
      <div className="flex flex-wrap gap-4">
        <div className={`flex items-center gap-3 glass-panel px-4 py-3 rounded-2xl ${isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white/60 border-slate-200 shadow-sm'}`}>
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Level {gamification.level}</div>
            <div className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{gamification.xp} XP</div>
          </div>
        </div>

        <div className={`flex items-center gap-3 glass-panel px-4 py-3 rounded-2xl ${isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white/60 border-slate-200 shadow-sm'}`}>
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Day Streak</div>
            <div className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{gamification.streak} Days</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {challenges.map(challenge => {
          const progress = Math.min((challenge.currentValue / challenge.targetValue) * 100, 100);
          const isCompleted = progress >= 100;
          const IconComponent = IconMap[challenge.icon] || Target;

          // Compute smart step size based on target value magnitude
          const getStepSize = () => {
            if (challenge.targetValue > 5000) return 1000;
            if (challenge.targetValue > 1000) return 250;
            if (challenge.targetValue > 100) return 10;
            if (challenge.targetValue > 10) return 5;
            return 1;
          };
          const stepSize = getStepSize();

          return (
            <div key={challenge.id} className={`glass-panel p-5 rounded-2xl relative overflow-hidden group ${isDarkMode ? 'border-white/5 bg-slate-900/60' : 'border-slate-200 bg-white/60 shadow-sm'}`}>
              <div 
                className="absolute left-0 top-0 bottom-0 w-1 opacity-25"
                style={{ backgroundColor: challenge.color }}
              />
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800" style={{ color: challenge.color }}>
                    <IconComponent className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{challenge.name}</h4>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-0.5 block">
                      {challenge.goalType} Mission
                    </span>
                  </div>
                </div>
                {isCompleted && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Award className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                )}
              </div>

              <div className={`h-2 w-full rounded-full overflow-hidden mb-3 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: challenge.color }}
                />
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                    {challenge.currentValue} / {challenge.targetValue}
                  </span>
                  
                  {/* Smart Daily Progress Quick Action Adjusters */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const updated = challenges.map(c => 
                          c.id === challenge.id 
                            ? { ...c, currentValue: Math.max(0, c.currentValue - stepSize) }
                            : c
                        );
                        setChallenges(updated);
                      }}
                      className={`p-1 rounded-md transition-colors ${
                        isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      title={`Decrease by ${stepSize}`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        const updated = challenges.map(c => 
                          c.id === challenge.id 
                            ? { ...c, currentValue: Math.min(c.targetValue, c.currentValue + stepSize) }
                            : c
                        );
                        setChallenges(updated);
                      }}
                      className={`p-1 rounded-md transition-colors ${
                        isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      title={`Increase by ${stepSize}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <span style={{ color: challenge.color }} className="font-bold">{Math.round(progress)}%</span>
              </div>
            </div>
          );
        })}

        <button 
          onClick={startEditing}
          className={`glass-panel p-5 rounded-2xl border border-dashed transition-colors flex flex-col items-center justify-center gap-2 min-h-[140px] ${isDarkMode ? 'border-slate-700 bg-slate-900/20 hover:bg-slate-800/40 text-slate-500 hover:text-slate-300' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
        >
          <Plus className="w-6 h-6" />
          <span className="text-sm font-medium">Create Mission</span>
        </button>
      </div>
    </div>
  );
}
