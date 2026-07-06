import React, { useState } from 'react';
import { Brain, Sparkles, Activity, Droplets, Moon, Send, Bot, User } from 'lucide-react';
import { RecoveryHydrationState, DailyWorkout, Challenge } from './Types';

interface Props {
  dailyWorkout: DailyWorkout | null;
  recoveryState: RecoveryHydrationState;
  challenges: Challenge[];
  isDarkMode: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIPerformanceCoach({ dailyWorkout, recoveryState, challenges, isDarkMode }: Props) {
  // Mock AI logic based on state
  const isHydrationLow = recoveryState.waterIntake < (recoveryState.dailyWaterGoal * 0.5);
  const isSleepLow = recoveryState.sleepDuration < 7;
  const isWorkoutCompleted = dailyWorkout?.isCompleted;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: 'I am your Biological Performance Coach. Ask me about your readiness, optimal recovery strategies, or how to adjust your training based on today\'s metrics.'
    }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Mock AI response
    setTimeout(() => {
      let reply = "Based on your current metrics, you should focus on consistency. ";
      if (isHydrationLow) reply += "Your system is under-hydrated; please consume water before intense output. ";
      if (isSleepLow) reply += "Since sleep was sub-optimal, consider a nap or reducing workout intensity. ";
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply
      }]);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="w-6 h-6 text-purple-400" />
        <h2 className={`text-2xl font-bold font-sans tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
          AI Performance Coach
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: AI Insights */}
        <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col h-full ${isDarkMode ? 'border-purple-500/20 bg-gradient-to-br from-slate-900 to-slate-950' : 'border-purple-200 bg-white shadow-sm'}`}>
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Daily Synthesis</h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Analyzing biological metrics...</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10 flex-1">
            {/* Insight 1: Workout */}
            <div className={`flex gap-4 p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
              <Activity className={`w-5 h-5 shrink-0 mt-0.5 ${isWorkoutCompleted ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-cyan-400' : 'text-cyan-600')}`} />
              <div>
                <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {isWorkoutCompleted ? 'Excellent Output' : 'Training Readiness: High'}
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {isWorkoutCompleted 
                    ? 'Your central nervous system performed optimally today. Prioritize active recovery.' 
                    : 'Your resting heart rate indicates full recovery. You are primed for today\'s protocol.'}
                </p>
              </div>
            </div>

            {/* Insight 2: Recovery / Hydration */}
            {(isHydrationLow || isSleepLow) && (
              <div className={`flex gap-4 p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                {isHydrationLow ? <Droplets className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" /> : <Moon className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />}
                <div>
                  <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Biological Flag Detected</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {isHydrationLow && isSleepLow 
                      ? 'Sub-optimal sleep and low hydration. Reduce workout intensity by 10% today and consume 1L of water immediately.'
                      : isHydrationLow 
                        ? 'System is dehydrated. Consume 500ml of water to optimize metabolic function before your next task.'
                        : 'Sub-optimal sleep detected. Consider a 20-minute NSDR protocol this afternoon.'}
                  </p>
                </div>
              </div>
            )}

            {/* Insight 3: Next Best Action */}
            <div className={`flex gap-4 p-4 rounded-xl border ${isDarkMode ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'}`}>
              <Brain className="w-5 h-5 shrink-0 mt-0.5 text-purple-500" />
              <div>
                <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-purple-200' : 'text-purple-800'}`}>Next Best Action</h4>
                <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  {!isWorkoutCompleted 
                    ? 'Initiate warm-up protocol for today\'s workout to spike core body temperature.'
                    : 'Execute evening wind-down routine. Dim lights and prepare for deep sleep architecture.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Coach Chat */}
        <div className={`glass-panel p-4 rounded-2xl border flex flex-col h-[500px] ${isDarkMode ? 'border-white/5 bg-slate-900/60' : 'border-slate-200 bg-white/60 shadow-sm'}`}>
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <Bot className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                )}
                
                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                  msg.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-br-sm' 
                    : isDarkMode ? 'bg-slate-800 text-slate-200 rounded-bl-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
                    <User className={`w-4 h-4 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className={`flex items-center gap-2 pt-2 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your coach..."
              className={`flex-1 border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-purple-500/50' : 'bg-white border-slate-300 text-slate-800 focus:border-purple-400'}`}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-11 h-11 shrink-0 rounded-xl bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
