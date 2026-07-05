import React from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  RotateCcw, 
  Play, 
  Pause, 
  Settings 
} from 'lucide-react';
import { Task } from '../types';

interface FocusExecutiveTimerProps {
  timerMode: 'focus' | 'short' | 'long';
  resetTimerMode: (mode: 'focus' | 'short' | 'long', overrideMinutes?: number) => void;
  isTimerRunning: boolean;
  setIsTimerRunning: (running: boolean) => void;
  selectedTaskForTimer: Task | undefined;
  isSoundOn: boolean;
  setIsSoundOn: (sound: boolean) => void;
  setIsFocusOverlayActive: (active: boolean) => void;
  progressPercent: number;
  secondsLeft: number;
  formatTime: (secs: number) => string;
  customMinutes: number;
  setCustomMinutes: React.Dispatch<React.SetStateAction<number>>;
  setSecondsLeft: React.Dispatch<React.SetStateAction<number>>;
  setCustomDuration: React.Dispatch<React.SetStateAction<number>>;
}

export default function FocusExecutiveTimer({
  timerMode,
  resetTimerMode,
  isTimerRunning,
  setIsTimerRunning,
  selectedTaskForTimer,
  isSoundOn,
  setIsSoundOn,
  setIsFocusOverlayActive,
  progressPercent,
  secondsLeft,
  formatTime,
  customMinutes,
  setCustomMinutes,
  setSecondsLeft,
  setCustomDuration,
}: FocusExecutiveTimerProps) {
  return (
    <motion.div 
      key="focus-section"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      id="pomodoro-timer-view"
    >
      {/* Left 2 Columns: Circular Clock Panel */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col items-center justify-between text-center min-h-[440px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none glow-bg-1" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none glow-bg-2" />

        <div className="w-full flex justify-between items-center border-b border-slate-200 dark:border-slate-800/60 pb-3 z-10">
          <span className="text-xs font-mono uppercase text-cyan-500 dark:text-cyan-400 flex items-center gap-1.5 font-bold">
            <Clock className="w-3.5 h-3.5 animate-pulse animate-duration-[2000ms]" /> FOCUS EXECUTIVE TIMER
          </span>
          
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setIsSoundOn(!isSoundOn)}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-transparent rounded-lg transition-all cursor-pointer"
            >
              {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button 
              type="button"
              onClick={() => setIsFocusOverlayActive(true)}
              className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Full Screen
            </button>
          </div>
        </div>

        {/* Modes Selection */}
        <div className="flex gap-2.5 my-4 bg-slate-100 dark:bg-slate-950/40 p-1 rounded-xl border border-slate-200 dark:border-slate-800 z-10">
          <button 
            type="button"
            onClick={() => resetTimerMode('focus')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              timerMode === 'focus' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Focus Session
          </button>
          <button 
            type="button"
            onClick={() => resetTimerMode('short')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              timerMode === 'short' ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Short Break
          </button>
          <button 
            type="button"
            onClick={() => resetTimerMode('long')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              timerMode === 'long' ? 'bg-blue-500 text-slate-950 font-bold shadow-md shadow-blue-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Long Break
          </button>
        </div>

        {/* Circular Ring Timer */}
        <div className="relative my-6 z-10 flex items-center justify-center">
          <svg className="w-56 h-56 transform -rotate-90">
            <circle 
              cx="112" 
              cy="112" 
              r="96" 
              className="stroke-slate-200/60 dark:stroke-slate-800/20" 
              strokeWidth="8" 
              fill="transparent" 
            />
            <circle 
              cx="112" 
              cy="112" 
              r="96" 
              stroke={timerMode === 'focus' ? '#06b6d4' : timerMode === 'short' ? '#10b981' : '#3b82f6'} 
              strokeWidth="8" 
              fill="transparent" 
              strokeDasharray={2 * Math.PI * 96}
              strokeDashoffset={2 * Math.PI * 96 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>

          {/* Counter text inside ring */}
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-display font-bold font-mono tracking-tight text-slate-800 dark:text-slate-100">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[9px] font-mono uppercase text-slate-500 mt-1 tracking-wider font-bold">
              {timerMode === 'focus' ? 'CONCENTRATION' : 'RECOVERY'}
            </span>
          </div>
        </div>

        {/* Core controls */}
        <div className="flex items-center gap-4 z-10 my-2">
          <button 
            type="button"
            onClick={() => resetTimerMode(timerMode)}
            className="p-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-all cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button 
            type="button"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className={`px-8 py-3 rounded-2xl font-mono text-sm font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              isTimerRunning
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:shadow-cyan-500/10'
            }`}
          >
            {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isTimerRunning ? 'Pause Session' : 'Begin Focus'}
          </button>
        </div>

        {/* Associated active Task details */}
        <div className="w-full border-t border-slate-200 dark:border-slate-800/60 pt-4 text-center z-10">
          {selectedTaskForTimer ? (
            <div>
              <span className="text-[9px] font-mono uppercase text-slate-500 font-bold">Currently Synchronized Focus Node</span>
              <h4 className="text-sm font-display font-medium text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">{selectedTaskForTimer.title}</h4>
              <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
                Completed cycles: {selectedTaskForTimer.pomodorosCompleted} / {selectedTaskForTimer.pomodorosEstimated} Pomodoros
              </p>
            </div>
          ) : (
            <div>
              <span className="text-[9px] font-mono uppercase text-slate-500 font-bold">No synchronized focus task selected</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Select an active task from the list to update its Pomodoro cycle logs automatically.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Custom Duration Configurator */}
      <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col justify-between min-h-[440px] text-left">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Settings className="w-4 h-4 text-cyan-500 dark:text-cyan-400 animate-spin-slow" />
              <h3 className="text-sm font-display font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                MANUAL TIMER SETUP
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Fine-tune your cognitive blocks. Adjust the duration manually or select a professional time preset.
            </p>
          </div>

          {/* Numeric Manual Input Control */}
          <div className="space-y-3">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
              Custom Focus Period
            </label>
            
            <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <button 
                type="button"
                onClick={() => {
                  const val = Math.max(1, customMinutes - 5);
                  setCustomMinutes(val);
                  if (!isTimerRunning) {
                    setSecondsLeft(val * 60);
                    setCustomDuration(val * 60);
                  }
                }}
                className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center transition-all text-sm select-none cursor-pointer"
              >
                -5
              </button>
              
              <div className="flex flex-col items-center">
                <div className="flex items-baseline">
                  <input 
                    type="number"
                    min="1"
                    max="360"
                    value={customMinutes}
                    onChange={(e) => {
                      const val = Math.min(360, Math.max(1, parseInt(e.target.value) || 25));
                      setCustomMinutes(val);
                      if (!isTimerRunning) {
                        setSecondsLeft(val * 60);
                        setCustomDuration(val * 60);
                      }
                    }}
                    className="bg-transparent text-center font-mono text-3xl font-bold text-cyan-600 dark:text-cyan-400 w-16 focus:outline-none focus:ring-0"
                  />
                  <span className="text-xs text-slate-500 font-mono">min</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => {
                  const val = Math.min(360, customMinutes + 5);
                  setCustomMinutes(val);
                  if (!isTimerRunning) {
                    setSecondsLeft(val * 60);
                    setCustomDuration(val * 60);
                  }
                }}
                className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center transition-all text-sm select-none cursor-pointer"
              >
                +5
              </button>
            </div>
          </div>

          {/* Visual Duration Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold">
              <span>1 Min</span>
              <span>180 Min</span>
            </div>
            <input 
              type="range"
              min="1"
              max="180"
              value={customMinutes}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 25;
                setCustomMinutes(val);
                if (!isTimerRunning) {
                  setSecondsLeft(val * 60);
                  setCustomDuration(val * 60);
                }
              }}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Professional Sprints Presets */}
          <div className="space-y-2 pt-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
              Focus Block Presets
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCustomMinutes(25);
                  resetTimerMode('focus', 25);
                }}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  customMinutes === 25 && timerMode === 'focus'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400' 
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-bold font-mono">25m Sprint</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Classic Pomodoro</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomMinutes(45);
                  resetTimerMode('focus', 45);
                }}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  customMinutes === 45 && timerMode === 'focus'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400' 
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-bold font-mono">45m Block</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Standard Sizing</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomMinutes(60);
                  resetTimerMode('focus', 60);
                }}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  customMinutes === 60 && timerMode === 'focus'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400' 
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-bold font-mono">60m Deep</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Extended Focus</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomMinutes(90);
                  resetTimerMode('focus', 90);
                }}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  customMinutes === 90 && timerMode === 'focus'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400' 
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-bold font-mono">90m Flow</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Elite Level Block</div>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl mt-4">
          <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1 font-bold">
            💡 EXECUTIVE TIP
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Deep focus requires custom block sizing. Pick your duration, set your phone to Do Not Disturb, and execute single-mindedly.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
