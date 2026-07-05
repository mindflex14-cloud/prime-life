import React, { useState } from 'react';
import { Target, Calendar, CheckSquare, Trash2, Plus, Flag, Trophy, Award, Trash } from 'lucide-react';
import { Goal, Milestone } from '../types';

interface GoalsAndMilestonesProps {
  goals: Goal[];
  milestones: Milestone[];
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>) => void;
  toggleGoalCompleted: (id: string) => void;
  deleteGoal: (id: string) => void;
  addMilestone: (milestone: Omit<Milestone, 'id' | 'completed'>) => void;
  toggleMilestoneCompleted: (id: string) => void;
  deleteMilestone: (id: string) => void;
}

export default function GoalsAndMilestones({
  goals,
  milestones,
  addGoal,
  toggleGoalCompleted,
  deleteGoal,
  addMilestone,
  toggleMilestoneCompleted,
  deleteMilestone
}: GoalsAndMilestonesProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(goals[0]?.id || null);

  // Form states for Goal
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('Career');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [showGoalForm, setShowGoalForm] = useState(false);

  // Form states for Milestone
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneTargetDate, setMilestoneTargetDate] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    addGoal({
      title: goalTitle,
      category: goalCategory,
      targetDate: goalTargetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: goalDesc
    });
    setGoalTitle('');
    setGoalDesc('');
    setShowGoalForm(false);
  };

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !milestoneTitle.trim()) return;
    addMilestone({
      goalId: selectedGoalId,
      title: milestoneTitle,
      targetDate: milestoneTargetDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setMilestoneTitle('');
    setMilestoneTargetDate('');
  };

  const categories = ['Career', 'Health', 'Finance', 'Relationships', 'Personal Growth', 'Fun', 'Environment', 'Spirituality'];

  // Current active goal calculation
  const currentGoal = goals.find(g => g.id === selectedGoalId);
  const goalMilestones = milestones.filter(m => m.goalId === selectedGoalId);
  const completedMilestonesCount = goalMilestones.filter(m => m.completed).length;
  const milestoneProgress = goalMilestones.length 
    ? Math.round((completedMilestonesCount / goalMilestones.length) * 100) 
    : 0;

  // Global Goal Stats
  const completedGoalsCount = goals.filter(g => g.completed).length;
  const totalGoalsCount = goals.length;
  const goalProgressPercentage = totalGoalsCount 
    ? Math.round((completedGoalsCount / totalGoalsCount) * 100) 
    : 0;

  return (
    <div className="space-y-6" id="goals-blueprints-view">
      
      {/* Blueprint Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="goals-stats-row">
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-550 dark:text-slate-400 uppercase">Goals Completion</span>
            <h3 className="text-2xl font-display font-bold text-cyan-600 dark:text-cyan-400 mt-1">{goalProgressPercentage}%</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{completedGoalsCount} of {totalGoalsCount} completed</p>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
            <Trophy className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-550 dark:text-slate-400 uppercase">Milestones Checked</span>
            <h3 className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {milestones.length ? Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100) : 0}%
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{milestones.filter(m => m.completed).length} of {milestones.length} milestones</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Award className="w-5 h-5 text-emerald-650 dark:text-emerald-400" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-550 dark:text-slate-400 uppercase">Deadlines Met</span>
            <h3 className="text-2xl font-display font-bold text-indigo-600 dark:text-indigo-400 mt-1">Active</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Focusing on high execution</p>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <Flag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="goals-management-panels">
        
        {/* Left Column: Goals List */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-display font-medium text-slate-800 dark:text-slate-200">Active Goals</h3>
            <button 
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="px-3 py-1 bg-cyan-550 dark:bg-cyan-500 hover:bg-cyan-650 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl font-mono flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Goal
            </button>
          </div>

          {/* Goal Creation Form overlay */}
          {showGoalForm && (
            <form onSubmit={handleCreateGoal} className="glass-panel p-4 rounded-xl space-y-3 border-cyan-500/30">
              <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold">Initialize Goal</h4>
              
              <div>
                <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mb-1">Goal Title</label>
                <input 
                  type="text" 
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Master React 19 Architecture"
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2 text-xs focus:border-cyan-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mb-1">Category</label>
                  <select 
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1.5 text-xs focus:border-cyan-500 outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mb-1">Target Date</label>
                  <input 
                    type="date" 
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1 text-xs focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mb-1">Description Blueprint</label>
                <textarea 
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  placeholder="Describe key parameters..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2 text-xs focus:border-cyan-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end text-xs font-mono">
                <button 
                  type="button" 
                  onClick={() => setShowGoalForm(false)}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-400 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-3 py-1.5 bg-cyan-550 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold rounded-lg hover:bg-cyan-600 dark:hover:bg-cyan-400 transition-all cursor-pointer"
                >
                  Create Goal
                </button>
              </div>
            </form>
          )}

          {/* Goals List */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {goals.map((goal) => {
              const isActive = goal.id === selectedGoalId;
              const completedMilestones = milestones.filter(m => m.goalId === goal.id && m.completed).length;
              const totalMilestones = milestones.filter(m => m.goalId === goal.id).length;
              const percent = totalMilestones ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

              return (
                <div 
                  key={goal.id}
                  onClick={() => setSelectedGoalId(goal.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border text-left flex flex-col justify-between ${
                    isActive 
                      ? 'glass-panel border-cyan-500/40 neon-glow-blue' 
                      : 'bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900/50 border-slate-200 dark:border-slate-800/80'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {goal.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-0.5 shrink-0">
                        <Calendar className="w-3 h-3" /> {goal.targetDate}
                      </span>
                    </div>

                    <h4 className={`text-sm font-display font-medium mt-2 ${goal.completed ? 'line-through text-slate-450 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                      {goal.title}
                    </h4>
                  </div>

                  <div className="mt-4 border-t border-slate-200 dark:border-slate-800/60 pt-2.5">
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-1">
                      <span>Milestones Progress:</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{percent}% ({completedMilestones}/{totalMilestones})</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-900/80 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-cyan-500 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {goals.length === 0 && (
              <div className="text-center p-8 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-slate-500 dark:text-slate-400 text-sm">No goal templates initialized.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Selected Goal Detailed Blueprint & Milestones */}
        <div className="lg:col-span-2 space-y-4">
          {currentGoal ? (
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-full min-h-[480px]">
              
              {/* Detailed Header */}
              <div className="space-y-4">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20 uppercase mr-2 font-bold">
                      {currentGoal.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      Target Completion: {currentGoal.targetDate}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleGoalCompleted(currentGoal.id)}
                      className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        currentGoal.completed 
                          ? 'bg-emerald-555 text-white dark:bg-emerald-500 dark:text-slate-950' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-705'
                      }`}
                    >
                      {currentGoal.completed ? '✓ Completed' : 'Mark Completed'}
                    </button>
                    <button 
                      onClick={() => {
                        deleteGoal(currentGoal.id);
                        setSelectedGoalId(goals.find(g => g.id !== currentGoal.id)?.id || null);
                      }}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-500/20 transition-all cursor-pointer"
                      title="Delete Goal Blueprint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {currentGoal.imageUrl && (
                  <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 relative group">
                    <img 
                      src={currentGoal.imageUrl} 
                      alt={currentGoal.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent" />
                    <span className="absolute bottom-3 left-3 bg-cyan-600 dark:bg-cyan-500/90 text-white dark:text-slate-950 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                      Visualization Sync Active
                    </span>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-display font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    {currentGoal.title}
                  </h2>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
                    {currentGoal.description || "No supplemental details logged."}
                  </p>
                </div>
              </div>

              {/* Milestones Sections */}
              <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Flag className="w-4 h-4 text-emerald-650 dark:text-emerald-400" />
                      Goal Milestones
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tactical checkpoints under this goal framework</p>
                  </div>
                  <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 font-bold">
                    {milestoneProgress}% complete
                  </span>
                </div>

                {/* Milestone Adding mini-form */}
                <form onSubmit={handleCreateMilestone} className="flex gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  <input 
                    type="text"
                    placeholder="Create checkpoint (e.g. Finish Core Database draft)..."
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                    className="bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none flex-1 px-2"
                    required
                  />
                  <input 
                    type="date"
                    value={milestoneTargetDate}
                    onChange={(e) => setMilestoneTargetDate(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] rounded p-1 font-mono max-w-28 outline-none border border-slate-200 dark:border-slate-700"
                  />
                  <button 
                    type="submit"
                    className="px-3 py-1 bg-emerald-555 dark:bg-emerald-500 hover:bg-emerald-650 dark:hover:bg-emerald-400 text-white dark:text-slate-950 rounded font-bold text-xs font-mono shrink-0 transition-all cursor-pointer"
                  >
                    + Add
                  </button>
                </form>

                {/* Milestones Checkbox List */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {goalMilestones.map((milestone) => (
                    <div 
                      key={milestone.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        milestone.completed 
                          ? 'bg-emerald-500/5 border-emerald-550/15 text-slate-500 dark:text-slate-400' 
                          : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate pr-2">
                        <input 
                          type="checkbox"
                          checked={milestone.completed}
                          onChange={() => toggleMilestoneCompleted(milestone.id)}
                          className="w-4 h-4 text-emerald-500 rounded border-slate-300 dark:border-slate-750 focus:ring-0 focus:ring-offset-0 bg-slate-50 dark:bg-slate-900 accent-emerald-500 shrink-0 cursor-pointer"
                        />
                        <span className={`text-xs font-medium truncate ${milestone.completed ? 'line-through text-slate-550 dark:text-slate-500' : ''}`}>
                          {milestone.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700/60">
                          Due: {milestone.targetDate}
                        </span>
                        <button 
                          type="button"
                          onClick={() => deleteMilestone(milestone.id)}
                          className="p-1 hover:bg-rose-500/10 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-all cursor-pointer"
                          title="Delete Checkpoint"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {goalMilestones.length === 0 && (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No milestones created yet. Add checkpoints above to break down your goal.
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center min-h-[480px] text-center text-slate-500 dark:text-slate-400">
              <Target className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-2" />
              <p className="text-sm">Please select a Goal from the side list or create a new one to examine milestones.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
