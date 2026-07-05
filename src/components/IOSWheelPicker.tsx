import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Check, X } from 'lucide-react';

interface WheelColumnProps {
  options: string[];
  selected: string;
  onChange: (val: string) => void;
  label: string;
}

function WheelColumn({ options, selected, onChange, label }: WheelColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitial = useRef(true);

  // Trigger a soft vibration when selection changes (Haptic simulation)
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch (e) {}
    }
  }, [selected]);

  // Handle scroll snap to update state
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const itemHeight = 36; // 36px per option line
    const scrollTop = el.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    if (index >= 0 && index < options.length) {
      const targetOpt = options[index];
      if (targetOpt !== selected) {
        onChange(targetOpt);
      }
    }
  };

  // Scroll to selected element on load
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const index = options.indexOf(selected);
      if (index !== -1) {
        container.scrollTop = index * 36;
      }
    }
  }, [selected, options]);

  return (
    <div className="flex flex-col items-center flex-1">
      <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-widest mb-2 select-none">
        {label}
      </span>
      <div className="h-[144px] w-full relative bg-slate-950/40 dark:bg-slate-950/70 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 flex flex-col overflow-hidden select-none">
        
        {/* Highlight Overlay bars for the centered active row (36px high, center is 54px from top) */}
        <div className="absolute top-[54px] left-0 right-0 h-[36px] bg-cyan-500/10 dark:bg-[#f43f5e]/10 border-y border-cyan-500/20 dark:border-[#f43f5e]/20 pointer-events-none z-10" />
        
        {/* Scrollable list */}
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full w-full overflow-y-auto no-scrollbar snap-y snap-mandatory scroll-smooth pb-12 pt-12"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {/* Top spacer padding (54px) */}
          <div className="h-[54px] shrink-0 pointer-events-none" />

          {options.map((opt) => {
            const isSelected = opt === selected;
            return (
              <div
                key={opt}
                className="h-[36px] shrink-0 w-full flex items-center justify-center snap-center"
              >
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    const idx = options.indexOf(opt);
                    if (containerRef.current) {
                      containerRef.current.scrollTop = idx * 36;
                    }
                  }}
                  className={`text-xs font-mono font-extrabold transition-all duration-150 py-1.5 px-3 rounded-lg cursor-pointer ${
                    isSelected 
                      ? 'text-cyan-400 dark:text-[#f43f5e] text-sm scale-110 font-black' 
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  {opt}
                </button>
              </div>
            );
          })}

          {/* Bottom spacer padding (54px) */}
          <div className="h-[54px] shrink-0 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

interface IOSWheelPickerProps {
  value: string; // formats supported: "HH:MM" (24h) or "HH:MM AM/PM" (12h)
  onChange: (timeStr: string) => void;
}

export default function IOSWheelPicker({ value, onChange }: IOSWheelPickerProps) {
  // Extract hour, minute and AM/PM
  const cleanVal = (value || '09:00 AM').trim().toUpperCase();
  const isPMInput = cleanVal.includes('PM');
  const numbersPart = cleanVal.replace(/[AP]M/, '').trim();
  const parts = numbersPart.split(':');
  
  let initialHour24 = parseInt(parts[0]) || 9;
  const initialMin = parseInt(parts[1]) || 0;
  
  let initialHour12 = initialHour24;
  let initialPeriod = isPMInput ? 'PM' : 'AM';

  if (initialHour24 > 12) {
    initialHour12 = initialHour24 - 12;
    initialPeriod = 'PM';
  } else if (initialHour24 === 12) {
    initialHour12 = 12;
    initialPeriod = 'PM';
  } else if (initialHour24 === 0) {
    initialHour12 = 12;
    initialPeriod = 'AM';
  }

  // Round minute to nearest 5 mins
  const initialMinSnapped = Math.round(initialMin / 5) * 5;
  const minStr = String(initialMinSnapped >= 60 ? 55 : initialMinSnapped).padStart(2, '0');
  const hourStr = String(initialHour12).padStart(2, '0');

  const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutesList = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
  const periodsList = ['AM', 'PM'];

  const handleUpdate = (h: string, m: string, p: string) => {
    let hrNum = parseInt(h);
    if (p === 'PM' && hrNum < 12) hrNum += 12;
    if (p === 'AM' && hrNum === 12) hrNum = 0;

    // Output formatted 12-hour AM/PM time
    onChange(`${h}:${m} ${p}`);
  };

  return (
    <div className="flex gap-3 items-center bg-slate-900/40 p-4 rounded-3xl border border-slate-200/40 dark:border-slate-800/80">
      <WheelColumn 
        label="Hour" 
        options={hoursList} 
        selected={hourStr} 
        onChange={(h) => handleUpdate(h, minStr, initialPeriod)} 
      />
      <WheelColumn 
        label="Minute" 
        options={minutesList} 
        selected={minStr} 
        onChange={(m) => handleUpdate(hourStr, m, initialPeriod)} 
      />
      <WheelColumn 
        label="AM/PM" 
        options={periodsList} 
        selected={initialPeriod} 
        onChange={(p) => handleUpdate(hourStr, minStr, p)} 
      />
    </div>
  );
}

// PREMIUM iOS SLIDE-UP BOTTOM SHEET WHEEL PICKER wrapper
interface IOSBottomSheetTimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (newVal: string) => void;
  title?: string;
}

export function IOSBottomSheetTimePicker({
  isOpen,
  onClose,
  value,
  onChange,
  title = "Select Target Time"
}: IOSBottomSheetTimePickerProps) {
  const [localVal, setLocalVal] = useState(value);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      setLocalVal(value);
    }
  }, [isOpen, value]);

  const handleDone = () => {
    onChange(localVal);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-md"
          />

          {/* Sliding Bottom Sheet */}
          <motion.div
            initial={{ y: 400, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            className="w-full max-w-md bg-slate-900/90 dark:bg-slate-950 border-t border-slate-800 backdrop-blur-2xl rounded-t-[32px] p-6 space-y-6 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Bar */}
            <div className="w-12 h-1 bg-slate-750 rounded-full mx-auto" />

            {/* Header controls row */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/50">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-mono uppercase font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <h4 className="text-xs font-mono font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-500 dark:text-[#f43f5e]" /> {title}
              </h4>
              <button
                type="button"
                onClick={handleDone}
                className="text-xs font-mono uppercase font-black text-cyan-400 dark:text-[#f43f5e] hover:brightness-110 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>

            {/* Embedded wheel pickers */}
            <div className="py-2">
              <IOSWheelPicker value={localVal} onChange={(newVal) => setLocalVal(newVal)} />
            </div>

            {/* Quick Helper Presets */}
            <div className="grid grid-cols-4 gap-2">
              {['08:00 AM', '12:00 PM', '05:30 PM', '09:00 PM'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setLocalVal(preset)}
                  className={`py-1.5 rounded-xl border text-[10px] font-mono font-bold transition-all ${localVal === preset ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  {preset.replace(':00', '')}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
