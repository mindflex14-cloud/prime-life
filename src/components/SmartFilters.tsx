import React from 'react';
import { Calendar, Clock, Inbox, Flag, AlertCircle, CheckCircle } from 'lucide-react';

export type FilterType = 'all' | 'today' | 'scheduled' | 'flagged' | 'overdue' | 'completed';

interface SmartFiltersProps {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  counts: Record<FilterType, number>;
}

export default function SmartFilters({ activeFilter, setActiveFilter, counts }: SmartFiltersProps) {
  const filtersList = [
    {
      id: 'today' as FilterType,
      label: 'Today',
      icon: Calendar,
      colorClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/15',
      activeClass: 'bg-blue-500 text-white border-blue-500 dark:text-slate-950',
      iconBg: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
      activeIconBg: 'bg-white/20 text-white dark:text-slate-950',
    },
    {
      id: 'scheduled' as FilterType,
      label: 'Scheduled',
      icon: Clock,
      colorClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 hover:bg-orange-500/15',
      activeClass: 'bg-orange-500 text-white border-orange-500 dark:text-slate-950',
      iconBg: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
      activeIconBg: 'bg-white/20 text-white dark:text-slate-950',
    },
    {
      id: 'all' as FilterType,
      label: 'All',
      icon: Inbox,
      colorClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 hover:bg-slate-500/15',
      activeClass: 'bg-slate-500 text-white border-slate-500 dark:text-slate-950',
      iconBg: 'bg-slate-500/20 text-slate-600 dark:text-slate-400',
      activeIconBg: 'bg-white/20 text-white dark:text-slate-950',
    },
    {
      id: 'flagged' as FilterType,
      label: 'Flagged',
      icon: Flag,
      colorClass: 'bg-red-500/10 text-red-650 dark:text-red-400 border-red-500/20 hover:bg-red-500/15',
      activeClass: 'bg-red-500 text-white border-red-500 dark:text-slate-950',
      iconBg: 'bg-red-500/20 text-red-650 dark:text-red-400',
      activeIconBg: 'bg-white/20 text-white dark:text-slate-950',
    },
    {
      id: 'overdue' as FilterType,
      label: 'Overdue',
      icon: AlertCircle,
      colorClass: 'bg-rose-600/10 text-rose-600 dark:text-rose-450 border-rose-600/20 hover:bg-rose-600/15',
      activeClass: 'bg-rose-600 text-white border-rose-600 dark:text-slate-950',
      iconBg: 'bg-rose-600/20 text-rose-600 dark:text-rose-400',
      activeIconBg: 'bg-white/20 text-white dark:text-slate-950',
    },
    {
      id: 'completed' as FilterType,
      label: 'Completed',
      icon: CheckCircle,
      colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15',
      activeClass: 'bg-emerald-500 text-white border-emerald-500 dark:text-slate-950',
      iconBg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      activeIconBg: 'bg-white/20 text-white dark:text-slate-950',
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" id="ios-smart-filters">
      {filtersList.map((f) => {
        const isActive = activeFilter === f.id;
        const Icon = f.icon;
        
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id)}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-[84px] transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden ${
              isActive 
                ? f.activeClass + ' scale-[1.02] shadow-md ring-2 ring-slate-400/20' 
                : f.colorClass + ' bg-white/45 dark:bg-slate-950/25'
            }`}
          >
            <div className="flex justify-between items-start w-full">
              <div className={`p-1.5 rounded-full ${isActive ? f.activeIconBg : f.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-xl font-bold font-mono ${isActive ? 'text-white dark:text-slate-950' : 'text-slate-800 dark:text-slate-100'}`}>
                {counts[f.id] || 0}
              </span>
            </div>
            
            <div className="mt-1">
              <span className={`text-xs font-sans font-semibold tracking-tight ${isActive ? 'text-white dark:text-slate-950' : 'text-slate-500 dark:text-slate-400'}`}>
                {f.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
