import React, { useState } from 'react';
import { Sparkles, Check, X, MessageSquare, Clock, ArrowRight, BrainCircuit } from 'lucide-react';
import { Goal } from '../types';

interface AIPredictionsProps {
  goals: Goal[];
  categories: string[];
  onAddSuggestedTask: (title: string, category: string, goalTitle?: string) => void;
}

export default function AIPredictions({ goals, categories, onAddSuggestedTask }: AIPredictionsProps) {
  const [activeTab, setActiveTab] = useState<'agent' | 'all'>('agent');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const [assistantPrompts, setAssistantPrompts] = useState([
    {
      id: 1,
      type: 'free_slot',
      message: "I noticed you have an open 2-hour window between 1:00 PM and 3:00 PM today. Would you like me to schedule your Deep Work strategy session?",
      title: "🧠 Strategic Deep Work Focus Block",
      category: "WEALTH CREATION",
      time: "01:00 PM",
      duration: "120m",
      actionLabel: "Schedule Session",
      ignored: false,
      scheduled: false
    },
    {
      id: 2,
      type: 'goal_booster',
      message: "Your active wealth goal requires high-leverage competitor analysis. Shall we lock in 45 minutes for that at 3:00 PM?",
      title: "📊 Competitor Analysis & Market Blueprinting",
      category: "WEALTH CREATION",
      time: "03:00 PM",
      duration: "45m",
      actionLabel: "Optimize Wealth Goal",
      ignored: false,
      scheduled: false
    },
    {
      id: 3,
      type: 'habit_streak',
      message: "You're on a 5-day training streak! Shall I generate your progressive overload fitness routine for today?",
      title: "🏋️ progressive Overload Strength Training",
      category: "BECOME INCREDIBLY MUSCULAR",
      time: "05:30 PM",
      duration: "60m",
      actionLabel: "Maintain Streak",
      ignored: false,
      scheduled: false
    }
  ]);

  const handleSchedule = (id: number, title: string, category: string, time: string) => {
    // Invoke the parent's add suggested task
    onAddSuggestedTask(title, category);
    
    // Update local state
    setAssistantPrompts(prev =>
      prev.map(p => p.id === id ? { ...p, scheduled: true } : p)
    );

    setChatResponse(`✨ Success: Scheduled "${title}" at ${time}. I've enabled push notifications for this milestone.`);
  };

  const handleIgnore = (id: number) => {
    setAssistantPrompts(prev =>
      prev.map(p => p.id === id ? { ...p, ignored: true } : p)
    );
  };

  const handleAskAI = (promptTitle: string) => {
    setIsTyping(true);
    setChatResponse(null);
    setTimeout(() => {
      setIsTyping(false);
      setChatResponse(`🤖 [AETHER AI Planner]: For your "${promptTitle}" block, I recommend a 50/10 Focus-to-Rest structure. Hydrate with 500ml water beforehand, disable phone alerts, and tackle the hardest milestone first.`);
    }, 900);
  };

  const activePrompts = assistantPrompts.filter(p => !p.ignored);

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm text-left space-y-5" id="ai-planner-assistant-card">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#f43f5e]/10 flex items-center justify-center text-[#f43f5e]">
            <BrainCircuit className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">
              AETHER.AI ASSISTANT
            </h4>
            <p className="text-[9.5px] text-slate-600 dark:text-slate-400">Contextual high-leverage execution advice</p>
          </div>
        </div>

        <div className="flex gap-1.5 bg-slate-100/60 dark:bg-slate-950/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('agent')}
            className={`px-3 py-1 text-[9px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'agent' 
                ? 'bg-[#f43f5e] text-white' 
                : 'text-slate-500 dark:text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            ACTIVE PILOT
          </button>
          <button
            type="button"
            onClick={() => {
              // Reset ignore states
              setAssistantPrompts(prev => prev.map(p => ({ ...p, ignored: false, scheduled: false })));
              setChatResponse("🔄 Pilot recommendations re-calibrated successfully.");
            }}
            className="px-2 py-1 text-[9px] font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Conversion prompt bubble */}
      {activePrompts.length > 0 ? (
        <div className="space-y-4">
          {activePrompts.map((p) => {
            if (p.scheduled) {
              return (
                <div 
                  key={p.id}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Scheduled Successfully</h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-slate-500">{p.title} locked in at {p.time}</p>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={p.id} 
                className="p-4 bg-slate-50/70 dark:bg-slate-950/20 border border-slate-200/40 dark:border-slate-800/60 rounded-2xl space-y-3.5 relative overflow-hidden"
              >
                {/* Micro Category Tag */}
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                    {p.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-450">
                    <Clock className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                    <span>{p.time} ({p.duration})</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-250 leading-relaxed font-sans font-medium">
                  "{p.message}"
                </p>

                {/* Interactive Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSchedule(p.id, p.title, p.category, p.time)}
                    className="flex-1 py-2 bg-[#f43f5e] hover:bg-rose-600 text-white font-mono font-bold text-[9px] rounded-xl tracking-wider transition-all uppercase cursor-pointer shadow-sm shadow-rose-500/10"
                  >
                    Schedule
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAskAI(p.title)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200/40 dark:border-slate-700/60 text-slate-650 dark:text-slate-200 font-mono font-bold text-[9px] rounded-xl uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" /> Ask AI
                  </button>

                  <button
                    type="button"
                    onClick={() => handleIgnore(p.id)}
                    className="p-2 bg-slate-100/60 hover:bg-rose-50 dark:bg-slate-800/40 hover:dark:bg-rose-950/20 rounded-xl text-slate-450 hover:text-red-500 border border-slate-200/40 dark:border-slate-700/40 transition-all cursor-pointer"
                    title="Ignore Recommendation"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-4 text-center text-slate-600 dark:text-slate-400 dark:text-slate-500 text-[11px] italic">
          ✨ All AI pilot recommendations completed or hidden for today.
        </div>
      )}

      {/* Conversation feedback logs */}
      {isTyping && (
        <div className="flex items-center gap-2 text-slate-450 dark:text-slate-500 text-[10px] font-mono animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          <span>Aether AI is synthesizing cognitive execution blueprints...</span>
        </div>
      )}

      {chatResponse && (
        <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/15 rounded-2xl text-[10.5px] font-mono text-cyan-700 dark:text-cyan-400 leading-relaxed text-left animate-fadeIn">
          {chatResponse}
        </div>
      )}
    </div>
  );
}
