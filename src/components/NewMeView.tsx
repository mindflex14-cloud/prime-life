import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';
import { saveUserDataToCloud } from '../lib/supabaseSync';
import { 
  Zap, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Save, 
  Sparkles, 
  Check, 
  HelpCircle, 
  FileText,
  Clock,
  ArrowDownCircle,
  FilePlus,
  Flame,
  Calendar,
  AlertTriangle,
  Smartphone,
  Cigarette,
  Ban,
  RefreshCw,
  Trophy
} from 'lucide-react';

export interface NewMeSection {
  id: string;
  title: string;
  content: string;
  isOpen: boolean;
  readToday?: boolean;
  createdDate?: string;
  targetReviewDate?: string;
}

export interface HabitIntervention {
  id: string;
  name: string;
  category: string;
  triggers: string;
  replacementRoutine: string;
  costToLegacy: string;
  cleanStreakDays: number;
  startDate?: string;
  lastRelapseDate?: string;
}

export default function NewMeView({ isDarkMode = true, userId }: { isDarkMode?: boolean; userId?: string }) {
  const [subTab, setSubTab] = useState<'mindset' | 'problems'>(() => {
    const saved = localStorage.getItem('lifeos_newme_subtab');
    return (saved === 'mindset' || saved === 'problems') ? saved : 'mindset';
  });

  useEffect(() => {
    localStorage.setItem('lifeos_newme_subtab', subTab);
  }, [subTab]);

  // Automatic Daily Reset for checked rules
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const lastReadDate = localStorage.getItem('lifeos_newme_last_read_date');
    if (lastReadDate !== todayStr) {
      setSections(prev => {
        // If there's no stored data or sections is empty, handle gracefully
        if (!prev) return [];
        return prev.map(s => ({ ...s, readToday: false }));
      });
      localStorage.setItem('lifeos_newme_last_read_date', todayStr);
    }
  }, []);

  // Load initial state or defaults
  const [sections, setSections] = useState<NewMeSection[]>(() => {
    const saved = localStorage.getItem('lifeos_newme_sections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'nm-1',
        title: 'Read everyday: (RULES that need to be drummed into your head as default codes)',
        content: `1. Be the author, not the reader of your destiny. Every hour requires complete conscious ownership.\n2. Compounding works silently. 4 hours of pure uninterrupted work beats 12 hours of distracted sliding.\n3. Protect health and vitality as sacred. Peak body state fuels peak enterprise thinking.\n4. Do not chase market noise. Seek high-leverage risk-mitigated strategies.`,
        isOpen: true
      },
      {
        id: 'nm-2',
        title: 'Read everyday or whenever in doubt:',
        content: `• Am I acting with executive speed, or am I procrastinating under the guise of "planning"?\n• Focus strictly on the primary objectives (₹8,000 Cr net worth, 20-25 Cr sanctuary, African enterprise).\n• Every distraction is a minor tax on your ultimate legacy.`,
        isOpen: false
      },
      {
        id: 'nm-3',
        title: 'READ EVERYDAY (LEARNINGS ABOUT YOU) (THINGS THAT EXPOSE YOU) (SELF DESTRUCTIVE)',
        content: `• Watch out for over-confidence after a winning streak.\n• Do not make commitments during emotional high-tides.\n• Guard your focus blocks against low-leverage requestors.\n• Identify self-sabotage loops early and terminate them.`,
        isOpen: false
      },
      {
        id: 'nm-4',
        title: 'PREVENTIVE MEASURES',
        content: `1. Strict digital hygiene: turn off non-essential notifications.\n2. Morning physical routine (Zone 2 cardio & strength) before any client/partner calls.\n3. Continuous cash reserves audit to ensure compounding velocity stays uninterrupted.`,
        isOpen: false
      },
      {
        id: 'nm-5',
        title: 'Everything about your behavior (data drop)',
        content: `Review current behavioral patterns. Document stress triggers, deep focus periods, habits of high-integrity execution, and mental models that yield high performance. Update this space continuously with live analytical feedback.`,
        isOpen: false
      },
      {
        id: 'nm-6',
        title: 'A specific problem (MAYA)',
        content: `MAYA (The illusion of progress without execution). \n• How to beat Maya: Count only concrete accomplishments, checked tasks, and assets verified.\n• Maintain high operational skepticism. Seek direct, validated truths over comfort.`,
        isOpen: false
      },
      {
        id: 'nm-7',
        title: 'Problem B (problems could be of any nature)',
        content: `hjghgb`,
        isOpen: true
      },
      {
        id: 'nm-8',
        title: 'My purpose',
        content: `To execute at the absolute highest tier of human capability, establishing a lasting legacy of architectural beauty, deep biological vitality, and ₹8,000 Cr sovereign financial power.`,
        isOpen: false
      },
      {
        id: 'nm-9',
        title: 'Visualization (things I need to buy):',
        content: `• Elite architectural layout drafts for the 20-25 Cr family sanctuary.\n• Premium biomarker and health longevity packages.\n• Advanced server configurations & business operations infrastructure in African trade hubs.`,
        isOpen: false
      }
    ];
  });

  const [dataDrop, setDataDrop] = useState<string>(() => {
    const saved = localStorage.getItem('lifeos_newme_datadrop');
    return saved !== null ? saved : 'Word by word. Instance by instance- what is happening?';
  });

  const [habitInterventions, setHabitInterventions] = useState<HabitIntervention[]>(() => {
    const saved = localStorage.getItem('lifeos_newme_interventions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'hi-1',
        name: 'Doom Scrolling & Phone Addiction',
        category: 'Digital Focus',
        triggers: 'Morning waking transitions, general boredom, fatigue at night, or task transitions.',
        replacementRoutine: 'Instantly lock phone in secondary drawer, perform 10 pushups, or read 2 physical book pages.',
        costToLegacy: 'Spikes and drains dopamine baseline, robs hours of high-leverage business execution, compromises presence.',
        cleanStreakDays: 3
      },
      {
        id: 'hi-2',
        name: 'Smoking & Nicotine Urges',
        category: 'Physical Vitality',
        triggers: 'Post-meal breaks, high-stress business meetings, late night operational blocks.',
        replacementRoutine: 'Inhale using the 4-7-8 breathing method for 2 minutes, hydrate with ice-cold mineral water, or chew strong sugar-free mint gum.',
        costToLegacy: 'Degrades arterial elasticity, reduces biological oxygenation, weakens sleep cycles and metabolic pace.',
        cleanStreakDays: 14
      },
      {
        id: 'hi-3',
        name: 'Sugar Crutches & Late-Night Snacking',
        category: 'Physical Vitality',
        triggers: 'Boredom after midnight, low-energy mental blocks, fatigue during intensive coding/creative sessions.',
        replacementRoutine: 'Inhale depth, brew organic hot peppermint/chamomile tea, and retire to bed immediately.',
        costToLegacy: 'Generates sudden insulin spikes, destroys sleep quality, promotes systemic low-grade cellular inflammation.',
        cleanStreakDays: 8
      }
    ];
  });

  const [isEditingSectionId, setIsEditingSectionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editReviewDate, setEditReviewDate] = useState('');
  const [editCreatedDate, setEditCreatedDate] = useState('');
  
  // Quick notice states
  const [saveFeedback, setSaveFeedback] = useState(false);

  // iOS Style modals & deletion flows
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newReviewDate, setNewReviewDate] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // iOS Style habit/problem modals & state
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState('Digital Focus');
  const [habitTriggers, setHabitTriggers] = useState('');
  const [habitReplacement, setHabitReplacement] = useState('');
  const [habitCost, setHabitCost] = useState('');
  const [habitStreak, setHabitStreak] = useState(0);
  const [habitStartDate, setHabitStartDate] = useState('');
  const [habitLastRelapseDate, setHabitLastRelapseDate] = useState('');
  const [deleteHabitId, setDeleteHabitId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('lifeos_newme_sections', JSON.stringify(sections));
    if (userId) {
      saveUserDataToCloud(userId, 'newMeSections', sections);
    }
  }, [sections, userId]);

  useEffect(() => {
    localStorage.setItem('lifeos_newme_datadrop', dataDrop);
    if (userId) {
      saveUserDataToCloud(userId, 'newMeDataDrop', dataDrop);
    }
  }, [dataDrop, userId]);

  useEffect(() => {
    localStorage.setItem('lifeos_newme_interventions', JSON.stringify(habitInterventions));
    if (userId) {
      saveUserDataToCloud(userId, 'newMeInterventions', habitInterventions);
    }
  }, [habitInterventions, userId]);

  // Real-time listener for cloud changes across tabs or devices
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { key, value } = customEvent.detail;
        if (key === 'lifeos_newme_sections' && JSON.stringify(value) !== JSON.stringify(sections)) {
          setSections(value);
        } else if (key === 'lifeos_newme_datadrop' && value !== dataDrop) {
          setDataDrop(value);
        } else if (key === 'lifeos_newme_interventions' && JSON.stringify(value) !== JSON.stringify(habitInterventions)) {
          setHabitInterventions(value);
        }
      }
    };
    window.addEventListener('local-storage-sync', handleSync);
    return () => {
      window.removeEventListener('local-storage-sync', handleSync);
    };
  }, [sections, dataDrop, habitInterventions]);

  const triggerSaveIndicator = () => {
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 1200);
  };

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, isOpen: !s.isOpen } : s));
  };

  const handleStartEdit = (sec: NewMeSection, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering accordion toggle
    setIsEditingSectionId(sec.id);
    setEditTitle(sec.title);
    setEditContent(sec.content);
    setEditCreatedDate(sec.createdDate || new Date().toISOString().split('T')[0]);
    setEditReviewDate(sec.targetReviewDate || '');
    // Auto-expand section on edit
    setSections(prev => prev.map(s => s.id === sec.id ? { ...s, isOpen: true } : s));
  };

  const handleSaveSection = (id: string) => {
    setSections(prev => prev.map(s => 
      s.id === id ? { 
        ...s, 
        title: editTitle, 
        content: editContent,
        createdDate: editCreatedDate,
        targetReviewDate: editReviewDate
      } : s
    ));
    setIsEditingSectionId(null);
    triggerSaveIndicator();
  };

  const handleDeleteSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering accordion toggle
    setDeleteTargetId(id);
  };

  const handleAddNewSection = () => {
    setNewTitle('');
    setNewContent('');
    setShowAddModal(true);
  };

  const handleStartAddHabit = () => {
    setEditingHabitId(null);
    setHabitName('');
    setHabitCategory('Digital Focus');
    setHabitTriggers('');
    setHabitReplacement('');
    setHabitCost('');
    setHabitStreak(0);
    setHabitStartDate(new Date().toISOString().split('T')[0]);
    setHabitLastRelapseDate('');
    setShowHabitModal(true);
  };

  const handleStartEditHabit = (habit: HabitIntervention) => {
    setEditingHabitId(habit.id);
    setHabitName(habit.name);
    setHabitCategory(habit.category);
    setHabitTriggers(habit.triggers);
    setHabitReplacement(habit.replacementRoutine);
    setHabitCost(habit.costToLegacy);
    setHabitStreak(habit.cleanStreakDays);
    setHabitStartDate(habit.startDate || new Date().toISOString().split('T')[0]);
    setHabitLastRelapseDate(habit.lastRelapseDate || '');
    setShowHabitModal(true);
  };

  const handleSaveHabit = () => {
    if (!habitName.trim()) {
      alert("Please enter a habit or problem name");
      return;
    }

    if (editingHabitId) {
      setHabitInterventions(prev => prev.map(h => 
        h.id === editingHabitId 
          ? { 
              ...h, 
              name: habitName, 
              category: habitCategory, 
              triggers: habitTriggers, 
              replacementRoutine: habitReplacement, 
              costToLegacy: habitCost, 
              cleanStreakDays: habitStreak,
              startDate: habitStartDate,
              lastRelapseDate: habitLastRelapseDate || undefined
            }
          : h
      ));
    } else {
      const newHabit: HabitIntervention = {
        id: `hi-${Date.now()}`,
        name: habitName,
        category: habitCategory,
        triggers: habitTriggers,
        replacementRoutine: habitReplacement,
        costToLegacy: habitCost,
        cleanStreakDays: habitStreak,
        startDate: habitStartDate || new Date().toISOString().split('T')[0],
        lastRelapseDate: habitLastRelapseDate || undefined
      };
      setHabitInterventions(prev => [newHabit, ...prev]);
    }

    setShowHabitModal(false);
    triggerSaveIndicator();
  };

  const handleIncrementStreak = (id: string) => {
    setHabitInterventions(prev => prev.map(h => 
      h.id === id ? { ...h, cleanStreakDays: h.cleanStreakDays + 1 } : h
    ));
    triggerSaveIndicator();
  };

  const handleResetStreak = (id: string) => {
    setHabitInterventions(prev => prev.map(h => 
      h.id === id ? { ...h, cleanStreakDays: 0 } : h
    ));
    triggerSaveIndicator();
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn" id="newme-executive-dashboard">
      
      {/* Top Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5 transition-colors duration-200 ${
        isDarkMode ? 'border-white/5' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-1.5">
            <Flame className="w-4 h-4 animate-pulse" /> Core Identity Programming
          </div>
          <h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            UNSTOPPABLE ME
          </h2>
          <p className={`text-sm mt-1 transition-colors duration-200 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Your non-negotiable mental rules, behavioral audit metrics, and custom problem frameworks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {saveFeedback && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xs text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg"
              >
                <Check className="w-3.5 h-3.5" /> Ledger Auto-saved
              </motion.span>
            )}
          </AnimatePresence>

          {subTab === 'mindset' ? (
            <button
              onClick={handleAddNewSection}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-mono text-xs rounded-xl flex items-center gap-2 shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <FilePlus className="w-4 h-4" /> Add Rule Block
            </button>
          ) : (
            <button
              onClick={handleStartAddHabit}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-mono text-xs rounded-xl flex items-center gap-2 shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Problem Solver
            </button>
          )}
        </div>
      </div>

      {/* iOS segmented sub-tabs control */}
      <div className="flex justify-start">
        <div className={`p-1 rounded-xl flex items-center max-w-sm w-full font-mono text-xs shadow-inner transition-colors duration-200 ${
          isDarkMode ? 'bg-[#141424] border border-white/5' : 'bg-slate-200/50 border border-slate-300/30'
        }`}>
          <button
            onClick={() => setSubTab('mindset')}
            className={`flex-1 py-2 rounded-lg font-bold text-center transition-all relative cursor-pointer ${
              subTab === 'mindset'
                ? isDarkMode 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm' 
                  : 'bg-white text-emerald-600 border border-slate-200 shadow-sm font-bold'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            MINDSET
          </button>
          <button
            onClick={() => setSubTab('problems')}
            className={`flex-1 py-2 rounded-lg font-bold text-center transition-all relative cursor-pointer ${
              subTab === 'problems'
                ? isDarkMode 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm' 
                  : 'bg-white text-emerald-600 border border-slate-200 shadow-sm font-bold'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            PROBLEM SOLVING
          </button>
        </div>
      </div>

      {/* MINDSET SECTION */}
      {subTab === 'mindset' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Today's Alignment Index Progress Card */}
          <div className={`p-4 md:p-5 rounded-2xl border transition-all ${
            isDarkMode 
              ? 'bg-[#0b0b14] border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.03)]' 
              : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  MINDSET INTEGRITY INDEX
                </span>
                <h4 className={`text-base font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  Daily Subconscious Alignment Progress
                </h4>
                <p className="text-xs text-slate-400 font-sans">
                  Read and check off your daily rules to lock in executive focus.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 font-sans">
                <div className="text-right">
                  <span className={`text-2xl font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {sections.filter(s => s.readToday).length} / {sections.length}
                  </span>
                  <span className="text-slate-500 text-[10px] block font-mono uppercase tracking-wider font-bold">Rules Anchored Today</span>
                </div>
                <div className="w-12 h-12 rounded-full border border-slate-800/80 flex items-center justify-center relative overflow-hidden bg-slate-950/40">
                  <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center font-mono text-[10px] font-bold text-emerald-400">
                    {sections.length > 0 ? Math.round((sections.filter(s => s.readToday).length / sections.length) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
            
            {/* Elegant Progress bar */}
            <div className="w-full h-1.5 bg-slate-900/60 rounded-full overflow-hidden mt-4 border border-slate-850/60">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500 rounded-full"
                style={{ width: `${sections.length > 0 ? (sections.filter(s => s.readToday).length / sections.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Main guideline accordion stack */}
          <div className="space-y-4" id="newme-rules-accordion-container">
            <AnimatePresence initial={false}>
              {sections.map((sec) => {
                const isEditing = isEditingSectionId === sec.id;
                return (
                  <motion.div 
                    key={sec.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ 
                      opacity: 0, 
                      x: -120, 
                      scale: 0.95, 
                      height: 0, 
                      marginTop: 0, 
                      marginBottom: 0,
                      overflow: 'hidden' 
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                      mass: 0.8
                    }}
                    className={`transition-all duration-200 rounded-2xl overflow-hidden border ${
                      sec.isOpen 
                        ? isDarkMode 
                          ? sec.readToday
                            ? 'bg-[#080d09]/70 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
                            : 'bg-[#0b0b12] border-slate-800/80 shadow-lg shadow-black/30' 
                          : 'bg-white border-slate-300 shadow-md'
                        : isDarkMode
                          ? sec.readToday
                            ? 'bg-[#060a07]/50 border-emerald-500/20 hover:border-emerald-500/40'
                            : 'bg-[#0b0b12] border-slate-900/60 hover:border-slate-800'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    {/* Accordion Trigger Header */}
                    <div 
                      onClick={() => !isEditing && toggleSection(sec.id)}
                      className={`p-4 flex justify-between items-center cursor-pointer select-none transition-colors ${
                        isDarkMode ? 'bg-white/1' : 'bg-slate-50/60'
                      }`}
                    >
                      <div className="flex-1 pr-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className={`w-full font-bold font-sans rounded-lg p-2 text-sm outline-none ${
                              isDarkMode 
                                ? 'bg-[#12121e] border border-cyan-500/35 text-white focus:border-cyan-400' 
                                : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-500'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            {/* Toggle Check Status Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSections(prev => prev.map(s => s.id === sec.id ? { ...s, readToday: !s.readToday } : s));
                                triggerSaveIndicator();
                              }}
                              className="focus:outline-none shrink-0 cursor-pointer"
                              title={sec.readToday ? "Mark unread today" : "Mark read & anchored today"}
                            >
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                                sec.readToday 
                                  ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' 
                                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'
                              }`}>
                                {sec.readToday && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </button>

                            <span className={`font-semibold text-sm md:text-base leading-relaxed flex items-center gap-2.5 ${
                              sec.readToday 
                                ? 'text-emerald-400/80 line-through decoration-emerald-500/40 opacity-75 font-sans' 
                                : isDarkMode ? 'text-slate-100 font-sans' : 'text-slate-800 font-sans'
                            }`}>
                              {sec.title}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveSection(sec.id)}
                            className="p-1.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" /> Save
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleStartEdit(sec, e)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDarkMode 
                                ? 'bg-white/5 hover:bg-cyan-500 hover:text-slate-950 text-slate-400' 
                                : 'bg-slate-100 hover:bg-cyan-100 hover:text-cyan-700 text-slate-600'
                            }`}
                            title="Edit Block Content"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={(e) => handleDeleteSection(sec.id, e)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isDarkMode 
                              ? 'bg-white/5 hover:bg-rose-500 hover:text-white text-slate-400' 
                              : 'bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-600'
                          }`}
                          title="Delete Block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="text-slate-500 pl-1">
                          {sec.isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Accordion Content Body */}
                    <AnimatePresence initial={false}>
                      {sec.isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className={`p-5 border-t ${
                            isDarkMode ? 'border-slate-800/80 bg-[#08080f]/80' : 'border-slate-150 bg-slate-50/40'
                          }`}>
                            {isEditing ? (
                              <div className="space-y-4">
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  rows={6}
                                  className={`w-full rounded-lg p-3 text-xs outline-none resize-none font-mono leading-relaxed ${
                                    isDarkMode 
                                      ? 'bg-[#12121e] border border-cyan-500/35 text-slate-100 focus:border-cyan-400' 
                                      : 'bg-white border border-slate-300 text-slate-900 focus:border-cyan-500'
                                  }`}
                                  placeholder="Inject guidelines, learnings, rules, or analyses here..."
                                />
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-500 font-bold block mb-1">Created Date</label>
                                    <input
                                      type="date"
                                      value={editCreatedDate}
                                      onChange={(e) => setEditCreatedDate(e.target.value)}
                                      className={`w-full text-xs font-mono rounded-lg p-2 outline-none ${
                                        isDarkMode ? 'bg-[#12121e] border border-white/5 text-white' : 'bg-slate-50 border border-slate-200 text-slate-900'
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-500 font-bold block mb-1">Target Review Date</label>
                                    <input
                                      type="date"
                                      value={editReviewDate}
                                      onChange={(e) => setEditReviewDate(e.target.value)}
                                      className={`w-full text-xs font-mono rounded-lg p-2 outline-none ${
                                        isDarkMode ? 'bg-[#12121e] border border-white/5 text-white' : 'bg-slate-50 border border-slate-200 text-slate-900'
                                      }`}
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className={`text-xs md:text-sm whitespace-pre-wrap leading-relaxed font-sans font-normal ${
                                  sec.readToday
                                    ? 'text-slate-400 opacity-80'
                                    : isDarkMode ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                  {sec.content}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/20 dark:border-white/5 text-[10px] font-mono text-slate-500">
                                  {sec.createdDate && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5" /> Programmed: {sec.createdDate}
                                    </span>
                                  )}
                                  {sec.targetReviewDate && (
                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                                      new Date(sec.targetReviewDate).getTime() < new Date().getTime()
                                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}>
                                      <Clock className="w-3.5 h-3.5" /> Review Due: {sec.targetReviewDate}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Freeform raw behavior Data Drop section */}
          <div className={`border rounded-3xl p-6 space-y-4 transition-colors duration-200 ${
            isDarkMode ? 'bg-[#0b0b12] border-white/5' : 'bg-white border-slate-200 shadow-sm'
          }`} id="newme-raw-datadrop-box">
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3 ${
              isDarkMode ? 'border-white/5' : 'border-slate-100'
            }`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Zap className="w-4 h-4 text-emerald-400" /> Data drop:
              </h3>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Auto-saved Sandbox Space</span>
            </div>

            <p className={`text-xs italic ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Word by word. Instance by instance - what is happening? Write your raw mental logs, active observations, and quick thoughts below.
            </p>

            <textarea
              value={dataDrop}
              onChange={(e) => {
                setDataDrop(e.target.value);
                if (Math.random() < 0.15) triggerSaveIndicator();
              }}
              placeholder="Dumping brain states... Live, continuous mental logging."
              rows={5}
              className={`w-full rounded-2xl p-4 text-xs md:text-sm outline-none font-mono leading-relaxed resize-none transition-colors ${
                isDarkMode 
                  ? 'bg-[#07070c] border-white/5 hover:border-white/10 text-slate-100 focus:border-emerald-500/30' 
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800 focus:border-emerald-500/30'
              }`}
            />
          </div>
        </div>
      )}

      {/* PROBLEM SOLVING SECTION */}
      {subTab === 'problems' && (
        <div className={`border rounded-3xl p-6 space-y-4 animate-fadeIn transition-colors duration-200 ${
          isDarkMode ? 'bg-[#0b0b12] border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
        }`} id="newme-habit-correction-panel">
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 ${
            isDarkMode ? 'border-slate-800/80' : 'border-slate-100'
          }`}>
            <div>
              <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white font-sans' : 'text-slate-900 font-sans'}`}>
                <Ban className="w-5 h-5 text-emerald-400 animate-pulse" /> Habit Correction & Problem Solvers
              </h3>
              <p className={`text-xs mt-1 leading-relaxed font-sans ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Deconstruct bad habits and repeating problems. Set explicit situational triggers, replacement plans, and track your clean streaks.
              </p>
            </div>
            
            <button
              onClick={handleStartAddHabit}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-mono text-xs rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Problem Solver
            </button>
          </div>

          {habitInterventions.length === 0 ? (
            <div className={`text-center py-8 rounded-2xl border space-y-2 ${
              isDarkMode ? 'bg-[#07070c] border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <Trophy className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-mono">No active problem solvers programmed yet.</p>
              <button
                type="button"
                onClick={handleStartAddHabit}
                className="text-xs text-emerald-400 font-mono hover:underline cursor-pointer"
              >
                + Program First Solution Block
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {habitInterventions.map((habit) => {
                  const streak = habit.cleanStreakDays;
                  const isZero = streak === 0;
                  const isMomentum = streak > 0 && streak < 7;
                  const isUnstoppable = streak >= 7;

                  let cardBorderClass = isDarkMode ? 'border-slate-800/80' : 'border-slate-200';
                  let streakThemeColor = 'text-amber-500';
                  let streakBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                  if (isZero) {
                    cardBorderClass = isDarkMode ? 'border-rose-500/20 hover:border-rose-500/40' : 'border-rose-200 hover:border-rose-300';
                    streakThemeColor = 'text-rose-400';
                    streakBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  } else if (isMomentum) {
                    cardBorderClass = isDarkMode ? 'border-cyan-500/20 hover:border-cyan-500/40' : 'border-cyan-200 hover:border-cyan-300';
                    streakThemeColor = 'text-cyan-400';
                    streakBadge = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
                  } else if (isUnstoppable) {
                    cardBorderClass = isDarkMode ? 'border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.02)]' : 'border-emerald-250 hover:border-emerald-350';
                    streakThemeColor = 'text-emerald-400';
                    streakBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.06)] animate-pulse';
                  }

                  return (
                    <motion.div
                      key={habit.id}
                      layout
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, x: -50 }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      className={`border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200 ${cardBorderClass} ${
                        isDarkMode ? 'bg-[#0e0e17]' : 'bg-slate-50/50 shadow-sm'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 bg-slate-500/10 border border-slate-700 text-slate-400 font-mono text-[9px] uppercase font-bold rounded-md">
                              {habit.category}
                            </span>
                            <span className={`px-2 py-0.5 border text-[9px] uppercase font-bold font-mono rounded-md flex items-center gap-1.5 tracking-wider ${streakBadge}`}>
                              {isZero && <AlertTriangle className="w-2.5 h-2.5 shrink-0" />}
                              {isMomentum && <Zap className="w-2.5 h-2.5 shrink-0" />}
                              {isUnstoppable && <Flame className="w-2.5 h-2.5 shrink-0" />}
                              {isZero ? 'RESET STATE' : isMomentum ? 'MOMENTUM' : 'UNSTOPPABLE STATUS'}
                            </span>
                          </div>
                          <h4 className={`text-base font-bold mt-2 leading-tight ${isDarkMode ? 'text-white font-sans' : 'text-slate-900 font-sans'}`}>{habit.name}</h4>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleStartEditHabit(habit)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDarkMode 
                                ? 'bg-white/5 hover:bg-emerald-500 hover:text-slate-950 text-slate-400' 
                                : 'bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-600'
                            }`}
                            title="Edit Problem Solver"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteHabitId(habit.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDarkMode 
                                ? 'bg-white/5 hover:bg-rose-500 hover:text-white text-slate-400' 
                                : 'bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-600'
                            }`}
                            title="Delete Problem Solver"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Deconstruction Blocks */}
                      <div className="space-y-2.5 text-xs">
                        {habit.triggers && (
                          <div className={`p-3 border rounded-xl ${
                            isDarkMode ? 'bg-[#171111]/40 border-red-500/10' : 'bg-red-50/40 border-red-200/50'
                          }`}>
                            <span className="text-[9px] font-mono text-red-400 uppercase font-bold block mb-1">SITUATIONAL TRIGGERS</span>
                            <p className={`leading-relaxed font-sans ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{habit.triggers}</p>
                          </div>
                        )}

                        {habit.replacementRoutine && (
                          <div className={`p-3 border rounded-xl ${
                            isDarkMode ? 'bg-[#111714]/40 border-emerald-500/10' : 'bg-emerald-50/40 border-emerald-200/50'
                          }`}>
                            <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold block mb-1">REPLACEMENT ACTION ROUTINE</span>
                            <p className={`leading-relaxed font-sans font-medium ${isDarkMode ? 'text-emerald-300/90' : 'text-emerald-800'}`}>{habit.replacementRoutine}</p>
                          </div>
                        )}

                        {habit.costToLegacy && (
                          <div className={`p-3 border rounded-xl ${
                            isDarkMode ? 'bg-white/1 border-white/5 text-slate-400' : 'bg-slate-100/50 border-slate-200 text-slate-600'
                          }`}>
                            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block mb-1">COST TO PERSONAL LEGACY</span>
                            <p className="italic leading-relaxed font-sans font-normal">"{habit.costToLegacy}"</p>
                          </div>
                        )}

                        {/* Dates of Intervention */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] font-mono text-slate-500">
                          {habit.startDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> Programmed: {habit.startDate}
                            </span>
                          )}
                          {habit.lastRelapseDate && (
                            <span className="flex items-center gap-1 text-amber-500">
                              <AlertTriangle className="w-3.5 h-3.5" /> Last Reset: {habit.lastRelapseDate}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* iOS Style Health Consistency Counter */}
                      <div className={`pt-2 border-t flex items-center justify-between ${isDarkMode ? 'border-slate-800/80' : 'border-slate-150'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isZero ? 'bg-rose-500/10 text-rose-400' : isMomentum ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {isUnstoppable ? <Flame className="w-4 h-4 text-emerald-400 animate-pulse" /> : <Trophy className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase block leading-none font-bold">Consistency Streak</span>
                            <span className={`text-xs font-bold font-sans mt-1 block transition-colors ${streakThemeColor}`}>
                              {habit.cleanStreakDays} {habit.cleanStreakDays === 1 ? 'Day' : 'Days'} Clean
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleResetStreak(habit.id)}
                            className={`px-2.5 py-1.5 font-mono text-[9px] uppercase font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                              isDarkMode 
                                ? 'bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400' 
                                : 'bg-slate-100 hover:bg-rose-500/10 text-slate-600 hover:text-rose-600'
                            }`}
                            title="Relapsed? Reset counter to 0"
                          >
                            <RefreshCw className="w-3 h-3 animate-spin-hover" /> Reset
                          </button>
                          <button
                            onClick={() => handleIncrementStreak(habit.id)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-[10px] rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-500/10"
                            title="Add 1 clean day"
                          >
                            <Plus className="w-3.5 h-3.5" /> +1 Day
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
      {/* Philosophy Callout Box */}
      <div className={`p-5 rounded-3xl border flex flex-col md:flex-row items-center gap-4 transition-colors duration-200 ${
        isDarkMode 
          ? 'glass-panel border-emerald-500/10 bg-gradient-to-r from-emerald-950/10 to-transparent' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="text-left">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Programming the Subconscious Operator</span>
          <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            By continuously reading your standard rules, recognizing self-destructive patterns, and dropping live mental logs in this sandbox, you establish a system level cognitive shield. This guarantees absolute compliance with your target trajectories.
          </p>
        </div>
      </div>

      {/* iOS-Style slide-up Compose Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            {/* Backdrop click to close */}
            <div className="absolute inset-0 bg-transparent" onClick={() => setShowAddModal(false)} />
            
            <motion.div
              initial={{ y: "100%", opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 28, stiffness: 320, mass: 0.9 }}
              className={`relative w-full max-w-lg border-t sm:border rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 font-sans text-left z-10 max-h-[90vh] overflow-y-auto ${
                isDarkMode ? 'bg-[#0e0e17] border-white/10' : 'bg-white border-slate-200 shadow-xl'
              }`}
            >
              {/* iOS drag handle indicator at the top */}
              <div className={`w-12 h-1 rounded-full mx-auto mb-2 sm:hidden ${isDarkMode ? 'bg-white/20' : 'bg-slate-300'}`} />

              {/* Modal Header */}
              <div className={`flex justify-between items-center pb-3 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <div>
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Sparkles className="w-4.5 h-4.5 text-emerald-400" /> New Guideline Block
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Program your behavior rules and execution codes</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`text-xs font-mono px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
              </div>

              {/* Preset templates scroll row */}
              <div className="space-y-1.5">
                <span className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>iOS Quick Presets</span>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x text-xs">
                  {[
                    { label: 'Identity Code 🌟', title: 'Read everyday: (My Identity Codes)', content: '1. Complete conscious ownership of destiny.\n2. Compounding works silently. 4 deep hours beat 12 distracted.\n3. Protect health and vitality as sacred.' },
                    { label: 'Self Check 🔍', title: 'Read everyday or whenever in doubt:', content: '• Am I acting with executive speed, or procrastinating?\n• Focus strictly on primary objectives (₹8,000 Cr net worth).\n• Every distraction is a minor tax.' },
                    { label: 'Preventive 🛡️', title: 'PREVENTIVE MEASURES', content: '1. Strict digital hygiene: turn notifications off.\n2. Morning physical routine before client/partner calls.\n3. Continuous cash reserves audit.' },
                    { label: 'Maya Strategy ⚔️', title: 'How to beat MAYA (Illusion of progress):', content: '• Count only concrete accomplishments and verified assets.\n• Maintain high operational skepticism.\n• Terminate feedback loops early.' }
                  ].map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewTitle(tmpl.title);
                        setNewContent(tmpl.content);
                      }}
                      className={`px-3 py-2 text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap snap-start shrink-0 font-sans border ${
                        isDarkMode 
                          ? 'bg-[#141424] hover:bg-emerald-500/10 hover:border-emerald-500/30 border-white/5 text-slate-200' 
                          : 'bg-slate-50 hover:bg-emerald-500/10 hover:border-emerald-500/30 border-slate-200 text-slate-800'
                      }`}
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rule Title / Category</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. READ EVERYDAY: PREVENTIVE MEASURES"
                    className={`w-full border focus:border-emerald-500/30 font-semibold font-sans rounded-xl p-3 text-sm outline-none transition-colors ${
                      isDarkMode ? 'bg-[#141424] border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Target Review Date (Optional)</label>
                  <input
                    type="date"
                    value={newReviewDate}
                    onChange={(e) => setNewReviewDate(e.target.value)}
                    className={`w-full border focus:border-emerald-500/30 font-mono rounded-xl p-3 text-xs outline-none transition-colors ${
                      isDarkMode ? 'bg-[#141424] border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1.5 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Guidelines / Mantras / Behavioral Codes</label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={6}
                    placeholder="List your non-negotiables, mental triggers, or strategic insights here..."
                    className={`w-full border focus:border-emerald-500/30 rounded-xl p-3.5 text-xs outline-none resize-none font-sans leading-relaxed transition-colors ${
                      isDarkMode ? 'bg-[#141424] border-white/5 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Main Action Button */}
              <button
                type="button"
                onClick={() => {
                  if (!newTitle.trim()) {
                    alert("Please provide a title");
                    return;
                  }
                  const newSec: NewMeSection = {
                    id: `nm-${Date.now()}`,
                    title: newTitle,
                    content: newContent || '...',
                    isOpen: true,
                    createdDate: new Date().toISOString().split('T')[0],
                    targetReviewDate: newReviewDate || undefined
                  };
                  setSections(prev => [newSec, ...prev]); // Insert at top
                  setShowAddModal(false);
                  setNewTitle('');
                  setNewContent('');
                  setNewReviewDate('');
                  triggerSaveIndicator();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-mono text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Save & Add Rule Block
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* iOS-Style Delete action sheet */}
      <AnimatePresence>
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-slate-950/80 backdrop-blur-sm">
            {/* Backdrop click to close */}
            <div className="absolute inset-0 bg-transparent" onClick={() => setDeleteTargetId(null)} />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`relative w-full max-w-sm border rounded-3xl overflow-hidden shadow-2xl p-5 space-y-3 font-sans text-center z-10 ${
                isDarkMode ? 'bg-[#161622] border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="py-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Remove Identity Rule Block?</h3>
                <p className={`text-xs mt-1.5 leading-relaxed font-sans ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  This action is irreversible. The selected block will be permanently removed from your active mental programming.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(null)}
                  className={`py-3 font-semibold rounded-2xl text-xs font-mono transition-all cursor-pointer ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSections(prev => prev.filter(s => s.id !== deleteTargetId));
                    setDeleteTargetId(null);
                    triggerSaveIndicator();
                  }}
                  className="py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs font-mono transition-all cursor-pointer"
                >
                  Delete Block
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* iOS-Style habit/problem Modal */}
      <AnimatePresence>
        {showHabitModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md">
            <div className="absolute inset-0 bg-transparent" onClick={() => setShowHabitModal(false)} />
            
            <motion.div
              initial={{ y: "100%", opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 28, stiffness: 320, mass: 0.9 }}
              className={`relative w-full max-w-lg border-t sm:border rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 font-sans text-left z-10 max-h-[90vh] overflow-y-auto ${
                isDarkMode ? 'bg-[#0e0e17] border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`w-12 h-1 rounded-full mx-auto mb-2 sm:hidden ${isDarkMode ? 'bg-white/20' : 'bg-slate-300'}`} />

              <div className={`flex justify-between items-center pb-3 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <div>
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Ban className="w-4.5 h-4.5 text-emerald-400" />
                    {editingHabitId ? 'Edit Problem Solver' : 'New Problem Solver'}
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Program your cognitive override to terminate bad habits</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHabitModal(false)}
                  className={`text-xs font-mono px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
              </div>

              {/* Presets Row */}
              {!editingHabitId && (
                <div className="space-y-1.5">
                  <span className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Problem Presets</span>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x text-xs">
                    {[
                      {
                        label: 'Doom Scrolling 📱',
                        name: 'Doom Scrolling & Social Media Overuse',
                        category: 'Digital Focus',
                        triggers: 'Boredom lying in bed, task transitions, or general mental fatigue.',
                        replacement: 'Immediately physicalize: stand up, drink 1 glass of ice-cold water, or open a Kindle biography to read exactly 2 pages.',
                        cost: 'Drains dopamine baseline, robs hours of high-leverage execution, compromises cognitive depth.'
                      },
                      {
                        label: 'Smoking 🚬',
                        name: 'Smoking & Nicotine Urges',
                        category: 'Physical Vitality',
                        triggers: 'Post-meal transitions, high-stress client/partner discussions, coding frustration.',
                        replacement: 'Initiate 4-7-8 breathing cycles for 2 mins, chew strong sugar-free peppermint gum, or squeeze an isometric grip trainer.',
                        cost: 'Causes cellular aging, impairs cardio baseline, disrupts high-integrity sleep cycles.'
                      },
                      {
                        label: 'Overthinking 🧠',
                        name: 'Anxious Overthinking & Analysis Paralysis',
                        category: 'Mental Strategy',
                        triggers: 'Unpredictable market variables, late-night scenario runs, isolation.',
                        replacement: 'Force pen-on-paper audit: write exactly 3 primary actions for tomorrow, then close the workspace.',
                        cost: 'Lowers operational speed, creates phantom crises, wastes sleep cycles.'
                      }
                    ].map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setHabitName(tmpl.name);
                          setHabitCategory(tmpl.category);
                          setHabitTriggers(tmpl.triggers);
                          setHabitReplacement(tmpl.replacement);
                          setHabitCost(tmpl.cost);
                        }}
                        className={`px-3 py-2 text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap snap-start shrink-0 font-sans border ${
                          isDarkMode 
                            ? 'bg-[#141424] hover:bg-emerald-500/10 hover:border-emerald-500/30 border-white/5 text-slate-200' 
                            : 'bg-slate-50 hover:bg-emerald-500/10 hover:border-emerald-500/30 border-slate-200 text-slate-800'
                        }`}
                      >
                        {tmpl.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fields */}
              <div className="space-y-3">
                <div>
                  <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Habit / Problem Name</label>
                  <input
                    type="text"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    placeholder="e.g. Doom Scrolling, Smoking, Sugar Crutches"
                    className={`w-full border focus:border-emerald-500/30 font-semibold font-sans rounded-xl p-3 text-sm outline-none transition-colors ${
                      isDarkMode ? 'bg-[#141424] border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Category</label>
                    <select
                      value={habitCategory}
                      onChange={(e) => setHabitCategory(e.target.value)}
                      className={`w-full border focus:border-emerald-500/30 font-sans rounded-xl p-3 text-sm outline-none transition-colors ${
                        isDarkMode ? 'bg-[#141424] border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="Digital Focus">Digital Focus</option>
                      <option value="Physical Vitality">Physical Vitality</option>
                      <option value="Mental Strategy">Mental Strategy</option>
                      <option value="Personal Manifest">Personal Manifest</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Current Streak (Days)</label>
                    <input
                      type="number"
                      value={habitStreak}
                      onChange={(e) => setHabitStreak(Math.max(0, parseInt(e.target.value) || 0))}
                      className={`w-full border focus:border-emerald-500/30 font-sans rounded-xl p-3 text-sm outline-none transition-colors ${
                        isDarkMode ? 'bg-[#141424] border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Intervention Start Date</label>
                    <input
                      type="date"
                      value={habitStartDate}
                      onChange={(e) => setHabitStartDate(e.target.value)}
                      className={`w-full border focus:border-emerald-500/30 font-mono rounded-xl p-3 text-xs outline-none transition-colors ${
                        isDarkMode ? 'bg-[#141424] border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Last Encounter / Relapse (Optional)</label>
                    <input
                      type="date"
                      value={habitLastRelapseDate}
                      onChange={(e) => setHabitLastRelapseDate(e.target.value)}
                      className={`w-full border focus:border-emerald-500/30 font-mono rounded-xl p-3 text-xs outline-none transition-colors ${
                        isDarkMode ? 'bg-[#141424] border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Situational Triggers</label>
                  <input
                    type="text"
                    value={habitTriggers}
                    onChange={(e) => setHabitTriggers(e.target.value)}
                    placeholder="When/why does it happen? e.g. Waking transitions, boredom, fatigue"
                    className={`w-full border focus:border-emerald-500/30 font-sans rounded-xl p-3 text-xs outline-none transition-colors ${
                      isDarkMode ? 'bg-[#141424] border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Replacement Action Routine</label>
                  <textarea
                    value={habitReplacement}
                    onChange={(e) => setHabitReplacement(e.target.value)}
                    rows={3}
                    placeholder="Explicit micro-actions to override the habit. e.g. Do 10 pushups, brew tea, drink ice water."
                    className={`w-full border focus:border-emerald-500/30 rounded-xl p-3 text-xs outline-none resize-none font-sans leading-relaxed transition-colors ${
                      isDarkMode ? 'bg-[#141424] border-white/5 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cost to Personal Legacy</label>
                  <input
                    type="text"
                    value={habitCost}
                    onChange={(e) => setHabitCost(e.target.value)}
                    placeholder="Why must this be eradicated? e.g. Spikes baseline dopamine, reduces health span"
                    className={`w-full border focus:border-emerald-500/30 font-sans rounded-xl p-3 text-xs outline-none transition-colors ${
                      isDarkMode ? 'bg-[#141424] border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveHabit}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-mono text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Solution Program
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* iOS-Style Habit Delete action sheet */}
      <AnimatePresence>
        {deleteHabitId && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-transparent" onClick={() => setDeleteHabitId(null)} />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`relative w-full max-w-sm border rounded-3xl overflow-hidden shadow-2xl p-5 space-y-3 font-sans text-center z-10 ${
                isDarkMode ? 'bg-[#161622] border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="py-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Delete Problem Solver?</h3>
                <p className={`text-xs mt-1.5 leading-relaxed font-sans ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  This action is irreversible. The selected bad habit deconstruction will be permanently erased.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteHabitId(null)}
                  className={`py-3 font-semibold rounded-2xl text-xs font-mono transition-all cursor-pointer ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHabitInterventions(prev => prev.filter(h => h.id !== deleteHabitId));
                    setDeleteHabitId(null);
                    triggerSaveIndicator();
                  }}
                  className="py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs font-mono transition-all cursor-pointer"
                >
                  Delete Solver
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
