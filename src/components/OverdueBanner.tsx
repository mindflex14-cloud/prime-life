import React, { useState } from 'react';
import { AlertCircle, Calendar, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface OverdueTask {
  id: string;
  title: string;
  dateStr: string;
  categoryName: string;
  categoryId: string;
}

interface OverdueBannerProps {
  overdueTasks: OverdueTask[];
  onReschedule: (taskId: string, originalDateStr: string, categoryId: string) => void;
  onRescheduleAll: () => void;
}

export default function OverdueBanner({ overdueTasks, onReschedule, onRescheduleAll }: OverdueBannerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (overdueTasks.length === 0) return null;

  return (
    <div className="bg-rose-500/10 dark:bg-rose-950/15 border border-rose-500/20 rounded-2xl overflow-hidden shadow-sm text-left animate-fadeIn" id="overdue-audit-banner">
      {/* Banner Header Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-rose-500/5 transition-all select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-rose-650 dark:text-rose-400 font-mono tracking-wider uppercase">
              ⚠️ OVERDUE TASKS IDENTIFIED ({overdueTasks.length})
            </h4>
            <p className="text-[10px] text-rose-500 dark:text-rose-450 mt-0.5">
              Some historical execution objectives remained unfinished. Maintain momentum.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRescheduleAll();
            }}
            className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded bg-rose-500 text-white hover:bg-rose-400 dark:text-slate-950 transition-all cursor-pointer shrink-0"
          >
            Reschedule All
          </button>
          {isOpen ? <ChevronUp className="w-4 h-4 text-rose-500" /> : <ChevronDown className="w-4 h-4 text-rose-500" />}
        </div>
      </div>

      {/* Expanded List */}
      {isOpen && (
        <div className="px-4 pb-4 border-t border-rose-500/10 bg-rose-500/[0.02] space-y-2 pt-3 max-h-[220px] overflow-y-auto no-scrollbar">
          {overdueTasks.map((t) => (
            <div 
              key={t.id} 
              className="flex items-center justify-between bg-white/40 dark:bg-slate-950/30 p-2.5 rounded-xl border border-rose-500/10 hover:border-rose-500/20 transition-all text-xs"
            >
              <div className="min-w-0">
                <span className="text-[8px] font-mono text-rose-600 dark:text-rose-400 uppercase font-bold bg-rose-500/10 px-1 py-0.5 rounded mr-1.5">
                  {t.dateStr}
                </span>
                <span className="text-[9px] font-mono text-slate-500 uppercase mr-1">
                  [{t.categoryName}]
                </span>
                <span className="text-slate-750 dark:text-slate-200 font-medium">
                  {t.title}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onReschedule(t.id, t.dateStr, t.categoryId)}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono font-bold uppercase rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all cursor-pointer border border-slate-200/50 dark:border-slate-800 shrink-0"
                title="Reschedule to Selected Date"
              >
                <span>Today</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
