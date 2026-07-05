import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Check, 
  Calendar, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Layers, 
  Gauge, 
  ShieldAlert,
  ArrowUpRight,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  CheckSquare,
  Square
} from 'lucide-react';
import { saveUserDataToCloud } from '../lib/supabaseSync';

export interface BusinessMilestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface BusinessIdea {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  status: 'Draft' | 'Researching' | 'Validating' | 'Planning' | 'Active';
  targetLaunchDate?: string;
  createdDate: string;
  
  // Feasibility Slider Metrics (1-10)
  marketDemand: number;
  executionEase: number;
  profitPotential: number;
  personalAlignment: number;
  
  // Additional Fields
  estimatedCapital: string;
  revenueModel: string;
  competitors: string;
  milestones: BusinessMilestone[];
  
  isOpen?: boolean;
}

interface BusinessIdeasViewProps {
  isDarkMode?: boolean;
  userId?: string;
}

const CATEGORIES = [
  'Fintech / Sovereign Wealth',
  'SaaS / Cognitive AI',
  'African Trade Hubs / Logistics',
  'Elite Real Estate / Sanctuary Assets',
  'Hardware / Edge Compute',
  'Healthcare & Longevity Biomarkers',
  'Other Venture'
];

export default function BusinessIdeasView({ isDarkMode = true, userId }: BusinessIdeasViewProps) {
  const [ideas, setIdeas] = useState<BusinessIdea[]>(() => {
    const saved = localStorage.getItem('lifeos_business_ideas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading business ideas", e);
      }
    }
    return [
      {
        id: 'bi-1',
        title: 'African sovereign logistics network',
        tagline: 'High-speed trade integration between regional hubs using algorithmic risk pricing',
        description: 'Establish a freight forwarding and trade clearance system linking logistics nodes in Lagos, Accra, and Nairobi. Utilizing a proprietary smart routing dashboard, we minimize custom delay variables and reduce port-to-warehouse timeline latency by 30%.',
        category: 'African Trade Hubs / Logistics',
        status: 'Researching',
        targetLaunchDate: '2027-03-31',
        createdDate: '2026-07-05',
        marketDemand: 9,
        executionEase: 4,
        profitPotential: 9,
        personalAlignment: 9,
        estimatedCapital: '₹12,000,000 Initial',
        revenueModel: '3% freight value transactional margin + custom clearance optimization fee structure',
        competitors: 'Legacy logistics brokers, standard state agencies, early stage trade startups',
        milestones: [
          { id: 'bm-1-1', title: 'Validate customs clearing protocols with Nigerian port authority contacts', completed: false, dueDate: '2026-10-15' },
          { id: 'bm-1-2', title: 'Develop prototype trade path optimization engine in Node.js', completed: false, dueDate: '2026-12-01' },
          { id: 'bm-1-3', title: 'Establish core capital commitment contracts', completed: false, dueDate: '2027-01-10' }
        ],
        isOpen: true
      },
      {
        id: 'bi-2',
        title: 'Cognitive OS V4 - Venture Enterprise SaaS',
        tagline: 'Personal and organizational optimization terminal backed by high-yield visual nodes',
        description: 'An premium, ultra-private operating workspace designed for high-net-worth enterprise builders to synchronize vision, capital deployment, biological command logs, and executive task sprints.',
        category: 'SaaS / Cognitive AI',
        status: 'Validating',
        targetLaunchDate: '2026-11-30',
        createdDate: '2026-06-15',
        marketDemand: 8,
        executionEase: 8,
        profitPotential: 8,
        personalAlignment: 10,
        estimatedCapital: '₹1,500,000 Server Infrastructure',
        revenueModel: 'Premium private cloud subscription (₹15,000/mo per seat)',
        competitors: 'Standard generic productivity planners, complex disconnected tools',
        milestones: [
          { id: 'bm-2-1', title: 'Release invitation-only sandboxed alpha to elite partners', completed: true, dueDate: '2026-07-20' },
          { id: 'bm-2-2', title: 'Implement real-time hybrid offline-first synchronization with RLS encryption', completed: true, dueDate: '2026-08-15' },
          { id: 'bm-2-3', title: 'Establish trademark and brand protection ledger', completed: false, dueDate: '2026-09-30' }
        ],
        isOpen: false
      }
    ];
  });

  const [saveFeedback, setSaveFeedback] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // New Idea form state
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('SaaS / Cognitive AI');
  const [newStatus, setNewStatus] = useState<'Draft' | 'Researching' | 'Validating' | 'Planning' | 'Active'>('Draft');
  const [newLaunchDate, setNewLaunchDate] = useState('');
  const [newMarket, setNewMarket] = useState(5);
  const [newEase, setNewEase] = useState(5);
  const [newProfit, setNewProfit] = useState(5);
  const [newAlign, setNewAlign] = useState(5);
  const [newCapital, setNewCapital] = useState('');
  const [newRevModel, setNewRevModel] = useState('');
  const [newCompetitors, setNewCompetitors] = useState('');

  // Editing state variables
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStatus, setEditStatus] = useState<'Draft' | 'Researching' | 'Validating' | 'Planning' | 'Active'>('Draft');
  const [editLaunchDate, setEditLaunchDate] = useState('');
  const [editMarket, setEditMarket] = useState(5);
  const [editEase, setEditEase] = useState(5);
  const [editProfit, setEditProfit] = useState(5);
  const [editAlign, setEditAlign] = useState(5);
  const [editCapital, setEditCapital] = useState('');
  const [editRevModel, setEditRevModel] = useState('');
  const [editCompetitors, setEditCompetitors] = useState('');

  // Active subtask inputs for each card
  const [newMilestoneText, setNewMilestoneText] = useState<Record<string, string>>({});
  const [newMilestoneDate, setNewMilestoneDate] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem('lifeos_business_ideas', JSON.stringify(ideas));
    if (userId) {
      saveUserDataToCloud(userId, 'businessIdeas', ideas);
    }
  }, [ideas, userId]);

  // Sync listener across tabs
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.key === 'lifeos_business_ideas') {
        const value = customEvent.detail.value;
        if (JSON.stringify(value) !== JSON.stringify(ideas)) {
          setIdeas(value);
        }
      }
    };
    window.addEventListener('local-storage-sync', handleSync);
    return () => window.removeEventListener('local-storage-sync', handleSync);
  }, [ideas]);

  const triggerSaveFeedback = () => {
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 1200);
  };

  const handleToggleOpen = (id: string) => {
    setIdeas(prev => prev.map(idea => idea.id === id ? { ...idea, isOpen: !idea.isOpen } : idea));
  };

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newIdea: BusinessIdea = {
      id: `bi-${Date.now()}`,
      title: newTitle,
      tagline: newTagline || 'A novel strategic business endeavor',
      description: newDesc,
      category: newCategory,
      status: newStatus,
      targetLaunchDate: newLaunchDate || undefined,
      createdDate: new Date().toISOString().split('T')[0],
      marketDemand: newMarket,
      executionEase: newEase,
      profitPotential: newProfit,
      personalAlignment: newAlign,
      estimatedCapital: newCapital || 'Under evaluation',
      revenueModel: newRevModel || 'Transactional sales model',
      competitors: newCompetitors || 'Direct and indirect market actors',
      milestones: [],
      isOpen: true
    };

    setIdeas(prev => [newIdea, ...prev]);
    setShowAddModal(false);
    triggerSaveFeedback();

    // Reset fields
    setNewTitle('');
    setNewTagline('');
    setNewDesc('');
    setNewLaunchDate('');
    setNewMarket(5);
    setNewEase(5);
    setNewProfit(5);
    setNewAlign(5);
    setNewCapital('');
    setNewRevModel('');
    setNewCompetitors('');
  };

  const handleStartEdit = (idea: BusinessIdea, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingIdeaId(idea.id);
    setEditTitle(idea.title);
    setEditTagline(idea.tagline);
    setEditDesc(idea.description);
    setEditCategory(idea.category);
    setEditStatus(idea.status);
    setEditLaunchDate(idea.targetLaunchDate || '');
    setEditMarket(idea.marketDemand);
    setEditEase(idea.executionEase);
    setEditProfit(idea.profitPotential);
    setEditAlign(idea.personalAlignment);
    setEditCapital(idea.estimatedCapital);
    setEditRevModel(idea.revenueModel);
    setEditCompetitors(idea.competitors);
    
    // Auto-expand on edit
    setIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, isOpen: true } : i));
  };

  const handleSaveEdit = (id: string) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id 
        ? {
            ...idea,
            title: editTitle,
            tagline: editTagline,
            description: editDesc,
            category: editCategory,
            status: editStatus,
            targetLaunchDate: editLaunchDate || undefined,
            marketDemand: editMarket,
            executionEase: editEase,
            profitPotential: editProfit,
            personalAlignment: editAlign,
            estimatedCapital: editCapital,
            revenueModel: editRevModel,
            competitors: editCompetitors
          }
        : idea
    ));
    setEditingIdeaId(null);
    triggerSaveFeedback();
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id));
    setDeleteTargetId(null);
    triggerSaveFeedback();
  };

  // Milestone/Action tasks logic
  const handleToggleMilestone = (ideaId: string, milestoneId: string) => {
    setIdeas(prev => prev.map(idea => {
      if (idea.id === ideaId) {
        return {
          ...idea,
          milestones: idea.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m)
        };
      }
      return idea;
    }));
    triggerSaveFeedback();
  };

  const handleAddMilestone = (ideaId: string) => {
    const text = newMilestoneText[ideaId];
    if (!text || !text.trim()) return;

    const newMilestone: BusinessMilestone = {
      id: `bm-${Date.now()}`,
      title: text.trim(),
      completed: false,
      dueDate: newMilestoneDate[ideaId] || undefined
    };

    setIdeas(prev => prev.map(idea => {
      if (idea.id === ideaId) {
        return {
          ...idea,
          milestones: [...idea.milestones, newMilestone]
        };
      }
      return idea;
    }));

    // Reset inputs
    setNewMilestoneText(prev => ({ ...prev, [ideaId]: '' }));
    setNewMilestoneDate(prev => ({ ...prev, [ideaId]: '' }));
    triggerSaveFeedback();
  };

  const handleDeleteMilestone = (ideaId: string, milestoneId: string) => {
    setIdeas(prev => prev.map(idea => {
      if (idea.id === ideaId) {
        return {
          ...idea,
          milestones: idea.milestones.filter(m => m.id !== milestoneId)
        };
      }
      return idea;
    }));
    triggerSaveFeedback();
  };

  // Helper: calculate weighted feasibility score (1-10 scale)
  // Weighted: Alignment (35%), Profit (30%), Demand (20%), Ease (15%)
  const calculateScore = (idea: BusinessIdea) => {
    const score = (idea.personalAlignment * 0.35) + 
                  (idea.profitPotential * 0.30) + 
                  (idea.marketDemand * 0.20) + 
                  (idea.executionEase * 0.15);
    return Math.round(score * 10) / 10;
  };

  // Countdown calendar helper
  const getDaysCountdown = (dateStr?: string) => {
    if (!dateStr) return null;
    const diffTime = new Date(dateStr).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Average Score of all ideas
  const avgScore = ideas.length > 0 
    ? Math.round((ideas.reduce((acc, curr) => acc + calculateScore(curr), 0) / ideas.length) * 10) / 10
    : 0;

  return (
    <div className="space-y-6 text-left animate-fadeIn" id="business-ideas-terminal">
      {/* Dynamic Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5 transition-colors duration-200 ${
        isDarkMode ? 'border-white/5' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1.5">
            <Briefcase className="w-4 h-4 text-cyan-400 animate-pulse" /> Strategic Ventures & Capital Models
          </div>
          <h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            BUSINESS VENTURE LAB
          </h2>
          <p className={`text-sm mt-1 transition-colors duration-200 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Audit capital requirements, model execution feasibility, and track path-to-market roadmaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {saveFeedback && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xs text-cyan-400 font-mono flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg"
              >
                <Check className="w-3.5 h-3.5 text-cyan-400" /> Ledger Synced
              </motion.span>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold font-mono text-xs rounded-xl flex items-center gap-2 shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Seed New Idea
          </button>
        </div>
      </div>

      {/* Analytical Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-[#0b0b14] border-white/5 shadow-sm' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">Total Staged Ventures</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400"><Briefcase className="w-4 h-4" /></span>
          </div>
          <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{ideas.length}</p>
          <span className="text-[10px] text-slate-400 block mt-1 font-mono uppercase tracking-widest font-bold">In Active Sandbox Incubation</span>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDarkMode ? 'bg-[#0b0b14] border-white/5 shadow-sm' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">Avg Feasibility Index</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><Gauge className="w-4 h-4" /></span>
          </div>
          <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{avgScore} <span className="text-sm font-medium text-slate-500">/ 10</span></p>
          <div className="w-full bg-slate-900/60 rounded-full h-1 mt-2 overflow-hidden border border-slate-850/40">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${avgScore * 10}%` }} />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border sm:col-span-2 lg:col-span-1 ${
          isDarkMode ? 'bg-[#0b0b14] border-white/5 shadow-sm' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">Next Horizon Goal</span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400"><TrendingUp className="w-4 h-4" /></span>
          </div>
          <p className={`text-sm font-bold mt-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Scale Sovereign reserves to ₹150 Cr</p>
          <p className="text-[11px] text-slate-400 mt-1">Weighted metric balancing alignment & enterprise profit factors.</p>
        </div>
      </div>

      {/* Main Venture Stream */}
      <div className="space-y-4" id="business-ideas-list-container">
        <AnimatePresence initial={false}>
          {ideas.map((idea) => {
            const isEditing = editingIdeaId === idea.id;
            const score = calculateScore(idea);
            const countdown = getDaysCountdown(idea.targetLaunchDate);

            // Determine Score Color
            const scoreColor = score >= 8.5 
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
              : score >= 7.0 
                ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' 
                : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

            return (
              <motion.div
                key={idea.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, height: 0, overflow: 'hidden' }}
                className={`rounded-2xl border transition-all duration-200 ${
                  idea.isOpen 
                    ? isDarkMode 
                      ? 'bg-[#090a12] border-cyan-500/30 shadow-lg shadow-cyan-950/10' 
                      : 'bg-white border-slate-300 shadow-md'
                    : isDarkMode 
                      ? 'bg-[#0b0b14] border-white/5 hover:border-cyan-500/10 hover:bg-[#0c0d1b]' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Venture Main Bar / Trigger */}
                <div 
                  onClick={() => !isEditing && handleToggleOpen(idea.id)}
                  className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none"
                >
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                        {idea.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold ${
                        idea.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : idea.status === 'Planning'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : idea.status === 'Validating'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5'
                      }`}>
                        {idea.status}
                      </span>
                      {idea.targetLaunchDate && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1 ${
                          countdown && countdown < 0 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {countdown === null 
                            ? 'No Target' 
                            : countdown < 0 
                              ? `Overdue by ${Math.abs(countdown)}d` 
                              : countdown === 0 
                                ? 'Launch Today' 
                                : `${countdown}d until launch`
                          }
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 mt-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className={`w-full font-bold font-sans rounded-lg p-2 text-sm outline-none ${
                            isDarkMode 
                              ? 'bg-[#12121e] border border-cyan-500/35 text-white focus:border-cyan-400' 
                              : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-500'
                          }`}
                        />
                        <input
                          type="text"
                          value={editTagline}
                          onChange={(e) => setEditTagline(e.target.value)}
                          className={`w-full text-xs font-sans rounded-lg p-2 outline-none ${
                            isDarkMode 
                              ? 'bg-[#12121e] border border-white/10 text-slate-300 focus:border-cyan-400' 
                              : 'bg-slate-50 border border-slate-300 text-slate-700 focus:border-cyan-500'
                          }`}
                          placeholder="Venture Tagline or One-liner..."
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                          {idea.title}
                        </h3>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} font-sans`}>
                          {idea.tagline}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Actions & Feasibility Rating Indicator */}
                  <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="text-right">
                      <span className={`px-2.5 py-1.5 rounded-xl border font-mono text-sm font-extrabold flex items-center gap-1.5 ${scoreColor}`}>
                        <Zap className="w-3.5 h-3.5 fill-current" /> {score} <span className="text-[10px] font-normal text-slate-500">FEASIBILITY</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(idea.id)}
                          className="p-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleStartEdit(idea, e)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            isDarkMode 
                              ? 'bg-white/5 hover:bg-cyan-500 hover:text-slate-950 text-slate-400' 
                              : 'bg-slate-100 hover:bg-cyan-100 hover:text-cyan-700 text-slate-600'
                          }`}
                          title="Edit Venture Model"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteTargetId(idea.id)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isDarkMode 
                            ? 'bg-white/5 hover:bg-rose-500 hover:text-white text-slate-400' 
                            : 'bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-600'
                        }`}
                        title="Delete Venture"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="text-slate-500 pl-1" onClick={() => handleToggleOpen(idea.id)}>
                        {idea.isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Venture Expanded Details */}
                <AnimatePresence>
                  {idea.isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`border-t ${
                        isDarkMode ? 'border-slate-800/80 bg-[#08080f]/80' : 'border-slate-150 bg-slate-50/40'
                      }`}
                    >
                      <div className="p-5 space-y-6">
                        
                        {/* Venture Specifications Editor / Display */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          
                          {/* Left Column: Description & Parameters */}
                          <div className="lg:col-span-7 space-y-4">
                            <div className="space-y-1.5">
                              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Venture Abstract</h4>
                              {isEditing ? (
                                <textarea
                                  value={editDesc}
                                  onChange={(e) => setEditDesc(e.target.value)}
                                  rows={5}
                                  className={`w-full rounded-lg p-3 text-xs outline-none resize-none font-sans leading-relaxed ${
                                    isDarkMode 
                                      ? 'bg-[#12121e] border border-cyan-500/35 text-slate-100 focus:border-cyan-400' 
                                      : 'bg-white border border-slate-300 text-slate-900 focus:border-cyan-500'
                                  }`}
                                />
                              ) : (
                                <p className={`text-xs leading-relaxed font-sans ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                  {idea.description || 'No detailed abstract recorded.'}
                                </p>
                              )}
                            </div>

                            {/* Operational Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#12121e]/60 border-white/5' : 'bg-white border-slate-200'}`}>
                                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">Target Capitalization</span>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editCapital}
                                    onChange={(e) => setEditCapital(e.target.value)}
                                    className={`w-full rounded p-1 text-xs outline-none ${
                                      isDarkMode ? 'bg-black/35 border border-white/10 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                                    }`}
                                  />
                                ) : (
                                  <p className="text-xs font-semibold font-mono flex items-center gap-1 text-cyan-400">
                                    <DollarSign className="w-3.5 h-3.5" /> {idea.estimatedCapital || 'Not Set'}
                                  </p>
                                )}
                              </div>

                              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#12121e]/60 border-white/5' : 'bg-white border-slate-200'}`}>
                                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">Primary Revenue Model</span>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editRevModel}
                                    onChange={(e) => setEditRevModel(e.target.value)}
                                    className={`w-full rounded p-1 text-xs outline-none ${
                                      isDarkMode ? 'bg-black/35 border border-white/10 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                                    }`}
                                  />
                                ) : (
                                  <p className={`text-xs font-semibold leading-normal font-sans ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                    {idea.revenueModel || 'Not Set'}
                                  </p>
                                )}
                              </div>

                              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#12121e]/60 border-white/5' : 'bg-white border-slate-200'}`}>
                                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">Strategic Milestones Target Date</span>
                                {isEditing ? (
                                  <input
                                    type="date"
                                    value={editLaunchDate}
                                    onChange={(e) => setEditLaunchDate(e.target.value)}
                                    className={`w-full rounded p-1 text-xs outline-none ${
                                      isDarkMode ? 'bg-black/35 border border-white/10 text-white font-mono' : 'bg-slate-50 border border-slate-300 text-slate-900 font-mono'
                                    }`}
                                  />
                                ) : (
                                  <p className={`text-xs font-semibold font-mono flex items-center gap-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                    <Calendar className="w-3.5 h-3.5" /> {idea.targetLaunchDate || 'No Target Date'}
                                  </p>
                                )}
                              </div>

                              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-[#12121e]/60 border-white/5' : 'bg-white border-slate-200'}`}>
                                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">Competitive Matrix</span>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editCompetitors}
                                    onChange={(e) => setEditCompetitors(e.target.value)}
                                    className={`w-full rounded p-1 text-xs outline-none ${
                                      isDarkMode ? 'bg-black/35 border border-white/10 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                                    }`}
                                  />
                                ) : (
                                  <p className={`text-xs font-semibold leading-normal font-sans ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                    {idea.competitors || 'Direct and indirect market actors'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Feasibility Dashboard Sliders & Status */}
                          <div className="lg:col-span-5 space-y-4 border-l border-slate-200 dark:border-white/5 lg:pl-6">
                            <div>
                              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-3">Feasibility Parameters</h4>
                              
                              <div className="space-y-4 font-sans text-xs">
                                {/* Sliders block */}
                                <div className="space-y-2.5">
                                  <div className="flex justify-between font-mono text-[10px] uppercase font-bold text-slate-400">
                                    <span>Market Demand / Tam</span>
                                    <span className="text-cyan-400 font-bold">{isEditing ? editMarket : idea.marketDemand}/10</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    disabled={!isEditing}
                                    value={isEditing ? editMarket : idea.marketDemand}
                                    onChange={(e) => setEditMarket(parseInt(e.target.value))}
                                    className="w-full accent-cyan-400 bg-slate-900/60 h-1.5 rounded-full cursor-pointer disabled:opacity-80"
                                  />
                                </div>

                                <div className="space-y-2.5">
                                  <div className="flex justify-between font-mono text-[10px] uppercase font-bold text-slate-400">
                                    <span>Ease of Execution</span>
                                    <span className="text-cyan-400 font-bold">{isEditing ? editEase : idea.executionEase}/10</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    disabled={!isEditing}
                                    value={isEditing ? editEase : idea.executionEase}
                                    onChange={(e) => setEditEase(parseInt(e.target.value))}
                                    className="w-full accent-cyan-400 bg-slate-900/60 h-1.5 rounded-full cursor-pointer disabled:opacity-80"
                                  />
                                </div>

                                <div className="space-y-2.5">
                                  <div className="flex justify-between font-mono text-[10px] uppercase font-bold text-slate-400">
                                    <span>Profit Potential / Margins</span>
                                    <span className="text-cyan-400 font-bold">{isEditing ? editProfit : idea.profitPotential}/10</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    disabled={!isEditing}
                                    value={isEditing ? editProfit : idea.profitPotential}
                                    onChange={(e) => setEditProfit(parseInt(e.target.value))}
                                    className="w-full accent-cyan-400 bg-slate-900/60 h-1.5 rounded-full cursor-pointer disabled:opacity-80"
                                  />
                                </div>

                                <div className="space-y-2.5">
                                  <div className="flex justify-between font-mono text-[10px] uppercase font-bold text-slate-400">
                                    <span>Personal & Sovereign Alignment</span>
                                    <span className="text-cyan-400 font-bold">{isEditing ? editAlign : idea.personalAlignment}/10</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    disabled={!isEditing}
                                    value={isEditing ? editAlign : idea.personalAlignment}
                                    onChange={(e) => setEditAlign(parseInt(e.target.value))}
                                    className="w-full accent-cyan-400 bg-slate-900/60 h-1.5 rounded-full cursor-pointer disabled:opacity-80"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Project Stage Configuration */}
                            {isEditing && (
                              <div className="space-y-2 pt-2">
                                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Venture Incubation Phase</label>
                                <select
                                  value={editStatus}
                                  onChange={(e) => setEditStatus(e.target.value as any)}
                                  className={`w-full text-xs font-mono rounded-lg p-2 outline-none ${
                                    isDarkMode ? 'bg-[#12121e] border border-white/10 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                                  }`}
                                >
                                  <option value="Draft">Draft Sandbox</option>
                                  <option value="Researching">Researching & Deep Tech Feasibility</option>
                                  <option value="Validating">Validating Market Hypotheses</option>
                                  <option value="Planning">Staging Business Capital Plan</option>
                                  <option value="Active">Active Operational Launch</option>
                                </select>
                              </div>
                            )}

                            {/* Additional Date metadata from user side */}
                            <div className="pt-2 text-[10px] font-mono text-slate-500 flex justify-between">
                              <span>Logged: {idea.createdDate}</span>
                              <span>Venture ID: {idea.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Staged Venture Task Roadmaps (Sub-Milestones) */}
                        <div className="border-t border-slate-200 dark:border-white/5 pt-5">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Execution Path & Deadlines</h4>
                          </div>

                          <div className="space-y-2.5">
                            {/* Milestone checklist items */}
                            {idea.milestones.map((milestone) => (
                              <div 
                                key={milestone.id}
                                className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                                  milestone.completed 
                                    ? isDarkMode 
                                      ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-400/80'
                                      : 'bg-slate-50 border-slate-200 text-slate-500 line-through'
                                    : isDarkMode 
                                      ? 'bg-black/10 border-white/5 text-slate-200' 
                                      : 'bg-white border-slate-200 text-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-3 pr-4">
                                  <button
                                    onClick={() => handleToggleMilestone(idea.id, milestone.id)}
                                    className="focus:outline-none cursor-pointer"
                                  >
                                    {milestone.completed ? (
                                      <CheckSquare className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                                    ) : (
                                      <Square className="w-4 h-4 text-slate-500 hover:text-cyan-400" />
                                    )}
                                  </button>
                                  <span className="text-xs font-sans font-medium">{milestone.title}</span>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  {milestone.dueDate && (
                                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-white/5 px-2 py-1 rounded text-slate-400 border border-slate-200 dark:border-white/5 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" /> {milestone.dueDate}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleDeleteMilestone(idea.id, milestone.id)}
                                    className="text-slate-500 hover:text-rose-400 p-1"
                                    title="Remove task"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}

                            {idea.milestones.length === 0 && (
                              <p className="text-xs text-slate-500 italic font-sans py-2">No active roadmap steps staged. Formulate next actions below.</p>
                            )}

                            {/* Add milestone sub-row */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                              <input
                                type="text"
                                placeholder="E.g. Setup payment gateway test API..."
                                value={newMilestoneText[idea.id] || ''}
                                onChange={(e) => setNewMilestoneText(prev => ({ ...prev, [idea.id]: e.target.value }))}
                                className={`flex-1 rounded-xl px-3 py-2 text-xs outline-none ${
                                  isDarkMode 
                                    ? 'bg-[#12121e] border border-white/5 text-slate-100 focus:border-cyan-500/50' 
                                    : 'bg-white border border-slate-300 text-slate-900 focus:border-cyan-500'
                                }`}
                              />
                              <div className="flex gap-2">
                                <input
                                  type="date"
                                  value={newMilestoneDate[idea.id] || ''}
                                  onChange={(e) => setNewMilestoneDate(prev => ({ ...prev, [idea.id]: e.target.value }))}
                                  className={`rounded-xl px-2 py-2 text-xs font-mono outline-none ${
                                    isDarkMode 
                                      ? 'bg-[#12121e] border border-white/5 text-slate-300' 
                                      : 'bg-white border border-slate-300 text-slate-800'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddMilestone(idea.id)}
                                  className="px-4 py-2 bg-slate-200 dark:bg-white/5 hover:bg-cyan-500 hover:text-slate-950 dark:hover:bg-cyan-500 dark:hover:text-slate-950 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border border-slate-300/40 dark:border-white/5 shrink-0"
                                >
                                  Deploy Task
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {ideas.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-800/80 rounded-2xl">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-400">Sandbox Empty</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">No business ventures staged yet. Click "Seed New Idea" to launch a blueprint.</p>
          </div>
        )}
      </div>

      {/* SEED IDEA FORM MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-xl rounded-3xl border shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto ${
                isDarkMode ? 'bg-[#0a0a10] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex justify-between items-start mb-4 border-b pb-3 dark:border-white/5">
                <div>
                  <h3 className="text-lg font-bold font-display uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Briefcase className="w-5 h-5 text-cyan-400" /> Stage Strategic Venture
                  </h3>
                  <p className="text-[11px] text-slate-400">Create a high-fidelity sandbox profile for testing & feasibility modeling.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white font-sans text-sm p-1">✕</button>
              </div>

              <form onSubmit={handleCreateIdea} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Venture Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="E.g. Algorithmic Commodity Arbitrage"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2.5 text-xs outline-none ${
                        isDarkMode ? 'bg-[#12121e] border border-white/5 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">One-Line Tagline</label>
                    <input 
                      type="text" 
                      placeholder="E.g. Microsecond supply chain price indexing..."
                      value={newTagline}
                      onChange={(e) => setNewTagline(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2.5 text-xs outline-none ${
                        isDarkMode ? 'bg-[#12121e] border border-white/5 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Venture Abstract / Deep Description</label>
                  <textarea 
                    rows={4}
                    placeholder="Provide execution mechanics, market alignment notes, operational procedures, etc."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className={`w-full rounded-xl p-3 text-xs outline-none resize-none ${
                      isDarkMode ? 'bg-[#12121e] border border-white/5 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Venture Sector</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className={`w-full text-xs font-mono rounded-xl p-2.5 outline-none ${
                        isDarkMode ? 'bg-[#12121e] border border-white/5 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Target Launch Deadline</label>
                    <input 
                      type="date" 
                      value={newLaunchDate}
                      onChange={(e) => setNewLaunchDate(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2.5 text-xs font-mono outline-none ${
                        isDarkMode ? 'bg-[#12121e] border border-white/5 text-slate-300' : 'bg-slate-50 border border-slate-300 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                {/* Slider Metrics */}
                <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-3.5">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">Feasibility Core Slider Audits</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[9px] uppercase font-bold text-slate-400">
                        <span>Market Demand</span>
                        <span className="text-cyan-400 font-bold">{newMarket}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={newMarket}
                        onChange={(e) => setNewMarket(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-slate-900/60 h-1.5 rounded-full cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[9px] uppercase font-bold text-slate-400">
                        <span>Execution Ease</span>
                        <span className="text-cyan-400 font-bold">{newEase}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={newEase}
                        onChange={(e) => setNewEase(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-slate-900/60 h-1.5 rounded-full cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[9px] uppercase font-bold text-slate-400">
                        <span>Profit Potential</span>
                        <span className="text-cyan-400 font-bold">{newProfit}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={newProfit}
                        onChange={(e) => setNewProfit(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-slate-900/60 h-1.5 rounded-full cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[9px] uppercase font-bold text-slate-400">
                        <span>Sovereign Alignment</span>
                        <span className="text-cyan-400 font-bold">{newAlign}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={newAlign}
                        onChange={(e) => setNewAlign(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-slate-900/60 h-1.5 rounded-full cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Spec Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Target Capital Requirement</label>
                    <input 
                      type="text" 
                      placeholder="E.g. ₹5,000,000 servers"
                      value={newCapital}
                      onChange={(e) => setNewCapital(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2.5 text-xs outline-none ${
                        isDarkMode ? 'bg-[#12121e] border border-white/5 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Revenue Capture Model</label>
                    <input 
                      type="text" 
                      placeholder="E.g. SaaS recurring seat tiers..."
                      value={newRevModel}
                      onChange={(e) => setNewRevModel(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2.5 text-xs outline-none ${
                        isDarkMode ? 'bg-[#12121e] border border-white/5 text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t dark:border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white text-xs font-mono font-bold rounded-xl shadow-lg shadow-cyan-500/10 transition-all cursor-pointer"
                  >
                    Seed Blueprint
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTargetId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-sm rounded-3xl border shadow-2xl p-5 overflow-hidden ${
                isDarkMode ? 'bg-[#0b0c14] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                  <ShieldAlert className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">De-Authorize Venture Blueprint?</h3>
                  <p className="text-xs text-slate-400 mt-1">This operation is irreversible. All linked milestones, scores, and metrics will be purged.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setDeleteTargetId(null)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-300 transition-colors"
                  >
                    Retain Block
                  </button>
                  <button
                    onClick={() => handleDeleteIdea(deleteTargetId)}
                    className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-mono font-bold text-white transition-colors"
                  >
                    Purge
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
