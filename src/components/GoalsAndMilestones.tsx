import React, { useState, useRef } from 'react';
import { Target, Calendar, CheckSquare, Trash2, Plus, Flag, Trophy, Award, Trash, Edit3, Save, Upload, Image as ImageIcon, X, Sparkles, AlertCircle } from 'lucide-react';
import { Goal, Milestone } from '../types';
import { SwipeableImageCarousel } from './SwipeableImageCarousel';

interface GoalsAndMilestonesProps {
  goals: Goal[];
  milestones: Milestone[];
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
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
  updateGoal,
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
  const [goalImageUrl, setGoalImageUrl] = useState('');
  const [goalQuote, setGoalQuote] = useState('');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [isDraggingGoal, setIsDraggingGoal] = useState(false);

  // Multiple image states
  const [goalImageUrls, setGoalImageUrls] = useState<string[]>([]);
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [editUrlInput, setEditUrlInput] = useState('');

  // Edit Goal states
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Career');
  const [editTargetDate, setEditTargetDate] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editQuote, setEditQuote] = useState('');
  const [isDraggingEditGoal, setIsDraggingEditGoal] = useState(false);

  // Refs for hidden file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Form states for Milestone
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneTargetDate, setMilestoneTargetDate] = useState('');

  // Process manual local image uploads via FileReader (Base64)
  const processImageFile = (file: File, isEdit: boolean) => {
    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const originalBase64 = reader.result as string;
      
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1024;
        const maxHeight = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          applyImage(originalBase64);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        try {
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          applyImage(compressedBase64);
        } catch (e) {
          console.error("Canvas compression failed, falling back to original", e);
          applyImage(originalBase64);
        }
      };
      
      img.onerror = () => {
        applyImage(originalBase64);
      };
      
      img.src = originalBase64;
    };

    const applyImage = (base64String: string) => {
      if (isEdit) {
        setEditImageUrl(base64String);
        setEditImageUrls(prev => {
          if (prev.includes(base64String)) return prev;
          return [...prev, base64String];
        });
      } else {
        setGoalImageUrl(base64String);
        setGoalImageUrls(prev => {
          if (prev.includes(base64String)) return prev;
          return [...prev, base64String];
        });
      }
    };

    reader.onerror = () => {
      alert("Error reading file");
    };
    reader.readAsDataURL(file);
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file) {
          processImageFile(file, isEdit);
        }
      }
    }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    const finalImageUrls = [...goalImageUrls];
    if (goalImageUrl.trim() && !finalImageUrls.includes(goalImageUrl.trim())) {
      finalImageUrls.unshift(goalImageUrl.trim());
    }
    addGoal({
      title: goalTitle,
      category: goalCategory,
      targetDate: goalTargetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: goalDesc,
      imageUrl: finalImageUrls[0] || undefined,
      imageUrls: finalImageUrls.length > 0 ? finalImageUrls : undefined,
      quote: goalQuote.trim() || undefined
    });
    setGoalTitle('');
    setGoalDesc('');
    setGoalImageUrl('');
    setGoalImageUrls([]);
    setGoalQuote('');
    setUrlInput('');
    setShowGoalForm(false);
  };

  const handleStartEditGoal = (goal: Goal) => {
    setEditTitle(goal.title);
    setEditCategory(goal.category);
    setEditTargetDate(goal.targetDate);
    setEditDesc(goal.description);
    setEditImageUrl(goal.imageUrl || '');
    setEditImageUrls(goal.imageUrls || (goal.imageUrl ? [goal.imageUrl] : []));
    setEditQuote(goal.quote || '');
    setIsEditingGoal(true);
  };

  const handleSaveEditGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !selectedGoalId) return;
    const finalImageUrls = [...editImageUrls];
    if (editImageUrl.trim() && !finalImageUrls.includes(editImageUrl.trim())) {
      finalImageUrls.unshift(editImageUrl.trim());
    }
    updateGoal(selectedGoalId, {
      title: editTitle,
      category: editCategory,
      targetDate: editTargetDate,
      description: editDesc,
      imageUrl: finalImageUrls[0] || undefined,
      imageUrls: finalImageUrls.length > 0 ? finalImageUrls : undefined,
      quote: editQuote.trim() || undefined
    });
    setEditUrlInput('');
    setIsEditingGoal(false);
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

              <div>
                <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mb-1">Motivational Quote or Mantra</label>
                <textarea 
                  value={goalQuote}
                  onChange={(e) => setGoalQuote(e.target.value)}
                  placeholder="e.g. Action is the foundational key to all success."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2 text-xs focus:border-cyan-500 outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mb-1">Goal Images (Drag & Drop multiple files or browse)</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingGoal(true);
                  }}
                  onDragLeave={() => setIsDraggingGoal(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingGoal(false);
                    const files = e.dataTransfer.files;
                    if (files) {
                      for (let i = 0; i < files.length; i++) {
                        const file = files.item(i);
                        if (file) {
                          processImageFile(file, false);
                        }
                      }
                    }
                  }}
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  className={`border-2 border-dashed rounded-lg p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDraggingGoal 
                      ? 'border-cyan-500 bg-cyan-500/10' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-cyan-500'
                  }`}
                >
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    Drag & drop files, or <span className="text-cyan-500">browse files</span>
                  </span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  multiple
                  onChange={(e) => handleFileUploadChange(e, false)}
                />

                {/* Thumbnail Row */}
                {goalImageUrls.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase block">Selected Images ({goalImageUrls.length})</span>
                    <div className="flex flex-wrap gap-1.5 p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 max-h-24 overflow-y-auto">
                      {goalImageUrls.map((url, idx) => (
                        <div key={idx} className="relative w-12 h-12 rounded overflow-hidden border border-slate-200 dark:border-slate-800 group bg-slate-100 dark:bg-slate-950 flex-shrink-0">
                          <img src={url} className="w-full h-full object-cover" alt="" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGoalImageUrls(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-slate-950/80 hover:bg-rose-500 rounded-full text-white cursor-pointer z-10"
                          >
                            <X className="w-2 h-2" />
                          </button>
                          <span className="absolute bottom-0 inset-x-0 text-center text-[7px] font-mono font-bold bg-black/60 text-white truncate pointer-events-none">
                            {idx === 0 ? 'Primary' : `#${idx + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct text input */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Or paste direct image URL and click '+'"
                    className="flex-1 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2 text-xs focus:border-cyan-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (urlInput.trim()) {
                        setGoalImageUrls(prev => [...prev, urlInput.trim()]);
                        setUrlInput('');
                      }
                    }}
                    className="px-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer shrink-0"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="flex gap-2 justify-end text-xs font-mono pt-1">
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
              
              {isEditingGoal ? (
                <form onSubmit={handleSaveEditGoal} className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                    <h4 className="text-sm font-display font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-cyan-550 dark:text-cyan-400" />
                      Edit Goal Blueprint
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => setIsEditingGoal(false)}
                      className="text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-slate-550 dark:text-slate-400 block mb-1">Goal Title</label>
                      <input 
                        type="text" 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2 text-xs focus:border-cyan-500 outline-none font-medium"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-mono text-slate-550 dark:text-slate-400 block mb-1">Category</label>
                        <select 
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2 text-xs focus:border-cyan-500 outline-none"
                        >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-550 dark:text-slate-400 block mb-1">Target Date</label>
                        <input 
                          type="date" 
                          value={editTargetDate}
                          onChange={(e) => setEditTargetDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-1.5 text-xs focus:border-cyan-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-550 dark:text-slate-400 block mb-1">Description Blueprint</label>
                    <textarea 
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2 text-xs focus:border-cyan-500 outline-none resize-none"
                      placeholder="Describe the milestone breakdown..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-550 dark:text-slate-400 block mb-1">Motivational Quote or Mantra</label>
                    <textarea 
                      value={editQuote}
                      onChange={(e) => setEditQuote(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2 text-xs focus:border-cyan-500 outline-none resize-none font-medium text-cyan-600 dark:text-cyan-300"
                      placeholder="Enter a quote or mantra to keep you inspired..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-550 dark:text-slate-400 block mb-1">Goal Images (Drag & Drop multiple files or browse)</label>
                    
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingEditGoal(true);
                      }}
                      onDragLeave={() => setIsDraggingEditGoal(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingEditGoal(false);
                        const files = e.dataTransfer.files;
                        if (files) {
                          for (let i = 0; i < files.length; i++) {
                            const file = files.item(i);
                            if (file) {
                              processImageFile(file, true);
                            }
                          }
                        }
                      }}
                      onClick={() => {
                        if (editFileInputRef.current) editFileInputRef.current.click();
                      }}
                      className={`border-2 border-dashed rounded-lg p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isDraggingEditGoal 
                          ? 'border-cyan-500 bg-cyan-500/10' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-cyan-500'
                      }`}
                    >
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        Drag & drop files, or <span className="text-cyan-500">browse files</span>
                      </span>
                    </div>
                    <input
                      type="file"
                      ref={editFileInputRef}
                      accept="image/*"
                      className="hidden"
                      multiple
                      onChange={(e) => handleFileUploadChange(e, true)}
                    />

                    {/* Thumbnail Row */}
                    {editImageUrls.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-550 dark:text-slate-400 uppercase block">Selected Images ({editImageUrls.length})</span>
                        <div className="flex flex-wrap gap-1.5 p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 max-h-24 overflow-y-auto">
                          {editImageUrls.map((url, idx) => (
                            <div key={idx} className="relative w-12 h-12 rounded overflow-hidden border border-slate-200 dark:border-slate-800 group bg-slate-100 dark:bg-slate-950 flex-shrink-0">
                              <img src={url} className="w-full h-full object-cover" alt="" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditImageUrls(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="absolute top-0.5 right-0.5 p-0.5 bg-slate-950/80 hover:bg-rose-500 rounded-full text-white cursor-pointer z-10"
                              >
                                <X className="w-2 h-2" />
                              </button>
                              <span className="absolute bottom-0 inset-x-0 text-center text-[7px] font-mono font-bold bg-black/60 text-white truncate pointer-events-none">
                                {idx === 0 ? 'Primary' : `#${idx + 1}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Direct text input */}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={editUrlInput}
                        onChange={(e) => setEditUrlInput(e.target.value)}
                        placeholder="Or paste direct image URL and click '+'"
                        className="flex-1 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg p-2 text-xs focus:border-cyan-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editUrlInput.trim()) {
                            setEditImageUrls(prev => [...prev, editUrlInput.trim()]);
                            setEditUrlInput('');
                          }
                        }}
                        className="px-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer shrink-0"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end text-xs font-mono pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button 
                      type="button" 
                      onClick={() => setIsEditingGoal(false)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-400 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-cyan-550 dark:bg-cyan-500 hover:bg-cyan-600 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                /* Detailed Header */
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
                        onClick={() => handleStartEditGoal(currentGoal)}
                        className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-bold rounded-lg border border-cyan-500/20 transition-all flex items-center gap-1 cursor-pointer"
                        title="Edit Goal Blueprint"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Blueprint
                      </button>
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

                  {((currentGoal.imageUrls && currentGoal.imageUrls.length > 0) || currentGoal.imageUrl) && (
                    <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 relative group">
                      <SwipeableImageCarousel 
                        images={currentGoal.imageUrls && currentGoal.imageUrls.length > 0 ? currentGoal.imageUrls : [currentGoal.imageUrl!]} 
                        alt={currentGoal.title} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent pointer-events-none" />
                      <span className="absolute bottom-3 left-3 bg-cyan-600 dark:bg-cyan-500/90 text-white dark:text-slate-950 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase z-10 pointer-events-none">
                        Visualization Sync Active
                      </span>
                    </div>
                  )}

                  {currentGoal.quote && (
                    <div className="relative p-4 bg-cyan-500/5 rounded-xl border border-cyan-550/10 italic text-xs text-cyan-600 dark:text-cyan-300 font-medium flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        "{currentGoal.quote}"
                      </div>
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
              )}

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
