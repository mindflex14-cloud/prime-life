import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Calendar, 
  Edit3, 
  Save, 
  CheckCircle2, 
  HelpCircle,
  Upload,
  Link2,
  AlertCircle,
  X,
  Settings,
  Clock,
  Globe,
  RefreshCw,
  Sliders,
  ChevronDown,
  Heart,
  Camera,
  Compass,
  Eye
} from 'lucide-react';
import { VisionCard, Goal } from '../types';
import { SwipeableImageCarousel } from './SwipeableImageCarousel';
import { saveUserDataToCloud } from '../lib/supabaseSync';

// High Precision Real-Time countdown subcomponent with BIG display typography
function GoalCountdown({ targetDate, isDarkMode }: { targetDate: string; isDarkMode: boolean }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOver: boolean;
  } | null>(null);

  useEffect(() => {
    const calculate = () => {
      // Parse YYYY-MM-DD as local date start
      const targetTime = new Date(`${targetDate}T00:00:00`).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (isNaN(targetTime) || diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  if (timeLeft.isOver) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-center py-2 px-4 rounded-xl text-xs uppercase tracking-widest font-bold mt-2">
        🎯 Target Horizon Achieved
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl text-center shadow-[inset_0_0_15px_rgba(6,182,212,0.04)] mt-3 border ${
      isDarkMode 
        ? 'bg-slate-950/70 border-cyan-500/15' 
        : 'bg-slate-50 border-cyan-500/20'
    }`}>
      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5 font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" /> Real-Time Deadline Countdown
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        <div className={`rounded-xl py-2 px-1 border ${isDarkMode ? 'bg-white/2 border-white/5' : 'bg-white border-slate-200'}`}>
          <span className="block text-2xl md:text-3xl font-bold font-mono text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)] leading-none">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[8px] font-mono text-slate-400 uppercase block mt-1">Days</span>
        </div>
        
        <div className={`rounded-xl py-2 px-1 border ${isDarkMode ? 'bg-white/2 border-white/5' : 'bg-white border-slate-200'}`}>
          <span className="block text-2xl md:text-3xl font-bold font-mono text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)] leading-none">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[8px] font-mono text-slate-400 uppercase block mt-1">Hours</span>
        </div>
        
        <div className={`rounded-xl py-2 px-1 border ${isDarkMode ? 'bg-white/2 border-white/5' : 'bg-white border-slate-200'}`}>
          <span className="block text-2xl md:text-3xl font-bold font-mono text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)] leading-none">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[8px] font-mono text-slate-400 uppercase block mt-1">Mins</span>
        </div>
        
        <div className={`rounded-xl py-2 px-1 border ${isDarkMode ? 'bg-white/2 border-white/5' : 'bg-white border-slate-200'}`}>
          <span className="block text-2xl md:text-3xl font-bold font-mono text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] leading-none animate-pulse">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[8px] font-mono text-slate-400 uppercase block mt-1">Secs</span>
        </div>
      </div>
    </div>
  );
}

interface EarthCountdownLiveDisplayProps {
  activeCountdownTarget: string;
  isDarkMode: boolean;
}

function EarthCountdownLiveDisplay({ activeCountdownTarget, isDarkMode }: EarthCountdownLiveDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOver: boolean;
  } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const targetTime = parseLocalISO(activeCountdownTarget).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (isNaN(targetTime) || diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [activeCountdownTarget]);

  if (!timeLeft) {
    return <div className="text-xs text-slate-400 font-mono animate-pulse">Calculating ticking bio-horizon...</div>;
  }

  return (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-xl">
      {/* DAYS */}
      <div className="bg-slate-950/75 border border-white/5 rounded-2xl py-2 px-1 text-center backdrop-blur-md">
        <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-mono text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)] leading-none">
          {String(timeLeft.days).padStart(2, '0')}
        </div>
        <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-1">Days</div>
      </div>

      {/* HOURS */}
      <div className="bg-slate-950/75 border border-white/5 rounded-2xl py-2 px-1 text-center backdrop-blur-md">
        <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-mono text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)] leading-none">
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-1">Hours</div>
      </div>

      {/* MINUTES */}
      <div className="bg-slate-950/75 border border-white/5 rounded-2xl py-2 px-1 text-center backdrop-blur-md">
        <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-mono text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)] leading-none">
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-1">Mins</div>
      </div>

      {/* SECONDS */}
      <div className="bg-slate-950/75 border border-cyan-500/25 rounded-2xl py-2 px-1 text-center backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.1)]">
        <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-mono text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.35)] leading-none animate-pulse">
          {String(timeLeft.seconds).padStart(2, '0')}
        </div>
        <div className="text-[9px] font-mono text-slate-300 uppercase tracking-widest font-bold mt-1">Secs</div>
      </div>
    </div>
  );
}

// Helper functions for timezone-safe local date operations
const formatLocalISO = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`;
};

const parseLocalISO = (str: string): Date => {
  if (!str) return new Date();
  const parts = str.split(/[-T:]/);
  if (parts.length < 5) return new Date(str);
  const yr = parseInt(parts[0]);
  const mo = parseInt(parts[1]) - 1;
  const dy = parseInt(parts[2]);
  const hr = parseInt(parts[3]);
  const mi = parseInt(parts[4]);
  const sc = parts[5] ? parseInt(parts[5]) : 0;
  return new Date(yr, mo, dy, hr, mi, sc);
};

interface VisualizationViewProps {
  visionCards: VisionCard[];
  goals: Goal[];
  onAddCard: (card: Omit<VisionCard, 'id'>) => void;
  onUpdateCard: (id: string, updates: Partial<VisionCard>) => void;
  onDeleteCard: (id: string) => void;
  isDarkMode?: boolean;
  userId?: string;
}

export default function VisualizationView({
  visionCards,
  goals,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  isDarkMode = true,
  userId
}: VisualizationViewProps) {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  // ==========================================
  // Premium Cosmic Earth Horizon Countdown State
  // ==========================================
  const [earthCountdownTarget, setEarthCountdownTarget] = useState<string>(() => {
    const saved = localStorage.getItem('lifeos_earth_target');
    if (saved) return saved;
    // Default: exactly 50 years into the future from now
    const target = new Date();
    target.setFullYear(target.getFullYear() + 50);
    return formatLocalISO(target);
  });

  const [earthCountdownTitle, setEarthCountdownTitle] = useState<string>(() => {
    return localStorage.getItem('lifeos_earth_title') || 'Time I Have on Earth';
  });

  const [earthCountdownImage, setEarthCountdownImage] = useState<string>(() => {
    return localStorage.getItem('lifeos_earth_image') || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';
  });

  const [earthCountdownQuote, setEarthCountdownQuote] = useState<string>(() => {
    return localStorage.getItem('lifeos_earth_quote') || 'Remember how small you are, how precious your seconds are, and how sovereign your attention must remain.';
  });

  const [showEarthEdit, setShowEarthEdit] = useState(false);

  // Form states for editing Earth Countdown
  const [editEarthTitle, setEditEarthTitle] = useState(earthCountdownTitle);
  const [editEarthTarget, setEditEarthTarget] = useState(earthCountdownTarget);
  const [editEarthImage, setEditEarthImage] = useState(earthCountdownImage);
  const [editEarthQuote, setEditEarthQuote] = useState(earthCountdownQuote);

  const [relativeOffsetError, setRelativeOffsetError] = useState<string | null>(null);

  // Direct Days, Hours, Minutes, Seconds relative adder states
  const [relativeDays, setRelativeDays] = useState<string>('');
  const [relativeHours, setRelativeHours] = useState<string>('');
  const [relativeMinutes, setRelativeMinutes] = useState<string>('');
  const [relativeSeconds, setRelativeSeconds] = useState<string>('');

  const earthFileInputRef = useRef<HTMLInputElement>(null);

  // Sync back on state change
  useEffect(() => {
    localStorage.setItem('lifeos_earth_target', earthCountdownTarget);
    if (userId) {
      saveUserDataToCloud(userId, 'earthCountdownTarget', earthCountdownTarget);
    }
  }, [earthCountdownTarget, userId]);

  useEffect(() => {
    localStorage.setItem('lifeos_earth_title', earthCountdownTitle);
    if (userId) {
      saveUserDataToCloud(userId, 'earthCountdownTitle', earthCountdownTitle);
    }
  }, [earthCountdownTitle, userId]);

  useEffect(() => {
    localStorage.setItem('lifeos_earth_image', earthCountdownImage);
    if (userId) {
      saveUserDataToCloud(userId, 'earthCountdownImage', earthCountdownImage);
    }
  }, [earthCountdownImage, userId]);

  useEffect(() => {
    localStorage.setItem('lifeos_earth_quote', earthCountdownQuote);
    if (userId) {
      saveUserDataToCloud(userId, 'earthCountdownQuote', earthCountdownQuote);
    }
  }, [earthCountdownQuote, userId]);

  // Sync listener across tabs and devices
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { key, value } = customEvent.detail;
        if (key === 'lifeos_earth_target' && value !== earthCountdownTarget) {
          setEarthCountdownTarget(value);
        } else if (key === 'lifeos_earth_title' && value !== earthCountdownTitle) {
          setEarthCountdownTitle(value);
        } else if (key === 'lifeos_earth_image' && value !== earthCountdownImage) {
          setEarthCountdownImage(value);
        } else if (key === 'lifeos_earth_quote' && value !== earthCountdownQuote) {
          setEarthCountdownQuote(value);
        }
      }
    };
    window.addEventListener('local-storage-sync', handleSync);
    return () => window.removeEventListener('local-storage-sync', handleSync);
  }, [earthCountdownTarget, earthCountdownTitle, earthCountdownImage, earthCountdownQuote]);

  const activeCountdownTarget = showEarthEdit ? editEarthTarget : earthCountdownTarget;

  // Helper to split editEarthTarget into components for direct edits
  const parsedTarget = parseLocalISO(editEarthTarget);
  const targetYear = isNaN(parsedTarget.getTime()) ? new Date().getFullYear() : parsedTarget.getFullYear();
  const targetMonth = isNaN(parsedTarget.getTime()) ? new Date().getMonth() + 1 : parsedTarget.getMonth() + 1;
  const targetDay = isNaN(parsedTarget.getTime()) ? new Date().getDate() : parsedTarget.getDate();
  const targetHour = isNaN(parsedTarget.getTime()) ? 12 : parsedTarget.getHours();
  const targetMinute = isNaN(parsedTarget.getTime()) ? 0 : parsedTarget.getMinutes();
  const targetSecond = isNaN(parsedTarget.getTime()) ? 0 : parsedTarget.getSeconds();

  const handleComponentChange = (field: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', val: number) => {
    const d = parseLocalISO(editEarthTarget);
    if (isNaN(d.getTime())) return;

    if (field === 'year') d.setFullYear(val);
    else if (field === 'month') d.setMonth(val - 1);
    else if (field === 'day') d.setDate(val);
    else if (field === 'hour') d.setHours(val);
    else if (field === 'minute') d.setMinutes(val);
    else if (field === 'second') d.setSeconds(val);

    setEditEarthTarget(formatLocalISO(d));
  };

  const applyRelativeOffset = () => {
    const days = parseInt(relativeDays) || 0;
    const hours = parseInt(relativeHours) || 0;
    const mins = parseInt(relativeMinutes) || 0;
    const secs = parseInt(relativeSeconds) || 0;

    if (days === 0 && hours === 0 && mins === 0 && secs === 0) {
      setRelativeOffsetError("Please enter some positive duration values (Days, Hours, Minutes, or Seconds) to compute.");
      return;
    }

    setRelativeOffsetError(null);
    const newTarget = new Date();
    newTarget.setDate(newTarget.getDate() + days);
    newTarget.setHours(newTarget.getHours() + hours);
    newTarget.setMinutes(newTarget.getMinutes() + mins);
    newTarget.setSeconds(newTarget.getSeconds() + secs);

    const targetStr = formatLocalISO(newTarget);
    setEditEarthTarget(targetStr);
    
    // Reset inputs
    setRelativeDays('');
    setRelativeHours('');
    setRelativeMinutes('');
    setRelativeSeconds('');
  };

  const handleEarthImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditEarthImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveEarthCountdown = () => {
    setEarthCountdownTitle(editEarthTitle);
    setEarthCountdownTarget(editEarthTarget);
    setEarthCountdownImage(editEarthImage);
    setEarthCountdownQuote(editEarthQuote);
    setShowEarthEdit(false);
  };
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [tempImageUrls, setTempImageUrls] = useState<string[]>([]);
  const [tempThumbnailUrl, setTempThumbnailUrl] = useState('');
  const [tempThumbnailUrls, setTempThumbnailUrls] = useState<string[]>([]);
  const [editUrlInput, setEditUrlInput] = useState('');
  const [tempCategory, setTempCategory] = useState('');
  const [tempTargetDate, setTempTargetDate] = useState('');
  const [tempGoalId, setTempGoalId] = useState('');
  
  // States for adding a new vision board card
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newThumbnailUrl, setNewThumbnailUrl] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newGoalId, setNewGoalId] = useState('');

  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);

  // Track image load failure state per card ID
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Editing direct inline instructions
  const [activeInstructionsId, setActiveInstructionsId] = useState<string | null>(null);
  const [activeInstructionsText, setActiveInstructionsText] = useState('');

  // Upload progress simulation or feedback
  const [uploadingCardId, setUploadingCardId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadCardIdRef = useRef<string | null>(null);

  const handleStartEdit = (card: VisionCard) => {
    setEditingCardId(card.id);
    setTempTitle(card.title);
    setTempImageUrl(card.imageUrl);
    setTempImageUrls(card.imageUrls || (card.imageUrl ? [card.imageUrl] : []));
    setTempThumbnailUrl(card.thumbnailUrl || card.imageUrl);
    setTempThumbnailUrls(card.thumbnailUrls || (card.thumbnailUrl ? [card.thumbnailUrl] : (card.imageUrls || [card.imageUrl])));
    setTempCategory(card.category);
    setTempTargetDate(card.targetDate || '');
    setTempGoalId(card.goalId || '');
  };

  const handleSaveEdit = (id: string) => {
    const finalImageUrls = tempImageUrls.filter(url => url && typeof url === 'string' && url.trim() !== '');
    const finalThumbnailUrls = tempThumbnailUrls.filter(url => url && typeof url === 'string' && url.trim() !== '');

    const primaryImageUrl = finalImageUrls[0] || tempImageUrl || '';
    const primaryThumbnailUrl = finalThumbnailUrls[0] || tempThumbnailUrl || primaryImageUrl;

    onUpdateCard(id, {
      title: tempTitle,
      imageUrl: primaryImageUrl,
      imageUrls: finalImageUrls.length > 0 ? finalImageUrls : undefined,
      thumbnailUrl: primaryThumbnailUrl,
      thumbnailUrls: finalThumbnailUrls.length > 0 ? finalThumbnailUrls : (finalImageUrls.length > 0 ? finalImageUrls : undefined),
      category: tempCategory,
      targetDate: tempTargetDate || undefined,
      goalId: tempGoalId || undefined
    });
    // Reset image error for this card when saving updates
    setImageErrors(prev => ({ ...prev, [id]: false }));
    setEditingCardId(null);
  };

  const handleStartInstructionsEdit = (card: VisionCard) => {
    setActiveInstructionsId(card.id);
    setActiveInstructionsText(card.instructions);
  };

  const handleSaveInstructions = (id: string) => {
    onUpdateCard(id, { instructions: activeInstructionsText });
    setActiveInstructionsId(null);
  };

  // Process manual local image uploads via FileReader (Base64)
  const processImageFile = (file: File, cardId?: string) => {
    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    
    if (cardId) {
      setUploadingCardId(cardId);
    }

    reader.onloadend = () => {
      const originalBase64 = reader.result as string;
      
      const img = new Image();
      img.onload = () => {
        // 1. Generate full-size image (max 1600x1600, quality 0.85)
        const maxWidth = 1600;
        const maxHeight = 1600;
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
        let fullBase64 = originalBase64;
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          try {
            fullBase64 = canvas.toDataURL('image/jpeg', 0.85);
          } catch (e) {
            console.error("Full-size canvas compression failed", e);
          }
        }

        // 2. Generate small thumbnail image (max 600x600, quality 0.8)
        const thumbMax = 600;
        let thumbW = img.width;
        let thumbH = img.height;
        if (thumbW > thumbH) {
          if (thumbW > thumbMax) {
            thumbH = Math.round((thumbH * thumbMax) / thumbW);
            thumbW = thumbMax;
          }
        } else {
          if (thumbH > thumbMax) {
            thumbW = Math.round((thumbW * thumbMax) / thumbH);
            thumbH = thumbMax;
          }
        }

        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = thumbW;
        thumbCanvas.height = thumbH;
        const thumbCtx = thumbCanvas.getContext('2d');
        let thumbBase64 = fullBase64;
        if (thumbCtx) {
          thumbCtx.drawImage(img, 0, 0, thumbW, thumbH);
          try {
            thumbBase64 = thumbCanvas.toDataURL('image/jpeg', 0.8);
          } catch (e) {
            console.error("Thumbnail canvas compression failed", e);
          }
        }

        applyImage(fullBase64, thumbBase64);
      };

      img.onerror = () => {
        applyImage(originalBase64, originalBase64);
      };

      img.src = originalBase64;
    };

    const applyImage = (base64String: string, thumbnailBase64: string) => {
      if (cardId) {
        // If we are actively editing this card, append to the temp edit lists
        if (editingCardId === cardId) {
          setTempImageUrl(base64String);
          setTempThumbnailUrl(thumbnailBase64);
          setTempImageUrls(prev => {
            const filtered = prev.filter(url => url && !url.startsWith('https://images.unsplash.com') && url.trim() !== '');
            if (filtered.includes(base64String)) return filtered;
            return [...filtered, base64String];
          });
          setTempThumbnailUrls(prev => {
            const filtered = prev.filter(url => url && !url.startsWith('https://images.unsplash.com') && url.trim() !== '');
            if (filtered.includes(thumbnailBase64)) return filtered;
            return [...filtered, thumbnailBase64];
          });
        } else {
          // If we are updating directly from the card overlay uploader
          const currentCard = visionCards.find(c => c.id === cardId);
          if (currentCard) {
            const currentList = (currentCard.imageUrls || (currentCard.imageUrl ? [currentCard.imageUrl] : []))
              .filter(url => url && !url.startsWith('https://images.unsplash.com') && url.trim() !== '');
            const updatedList = currentList.includes(base64String) ? currentList : [...currentList, base64String];
            
            const currentThumbList = (currentCard.thumbnailUrls || (currentCard.thumbnailUrl ? [currentCard.thumbnailUrl] : []))
              .filter(url => url && !url.startsWith('https://images.unsplash.com') && url.trim() !== '');
            const updatedThumbList = currentThumbList.includes(thumbnailBase64) ? currentThumbList : [...currentThumbList, thumbnailBase64];

            onUpdateCard(cardId, {
              imageUrl: base64String,
              imageUrls: updatedList,
              thumbnailUrl: thumbnailBase64,
              thumbnailUrls: updatedThumbList
            });
          } else {
            onUpdateCard(cardId, { 
              imageUrl: base64String,
              thumbnailUrl: thumbnailBase64
            });
          }
        }
        setImageErrors(prev => ({ ...prev, [cardId]: false }));
        setUploadingCardId(null);
      } else {
        setNewImageUrl(base64String);
        setNewThumbnailUrl(thumbnailBase64);
      }
    };

    reader.onerror = () => {
      alert("Error reading file");
      setUploadingCardId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>, cardId?: string) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file) {
          processImageFile(file, cardId);
        }
      }
    }
  };

  const triggerUploadClick = (cardId: string) => {
    activeUploadCardIdRef.current = cardId;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Use default premium placeholder if no image provided
    const imgUrl = newImageUrl.trim() || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80';
    const thumbUrl = newThumbnailUrl.trim() || imgUrl;

    onAddCard({
      title: newTitle,
      imageUrl: imgUrl,
      imageUrls: [imgUrl],
      thumbnailUrl: thumbUrl,
      thumbnailUrls: [thumbUrl],
      category: newCategory || 'Personal Manifest',
      targetDate: newTargetDate || undefined,
      instructions: newInstructions.trim() || 'Add your visual reminders, action guides, and strategic declarations here.',
      goalId: newGoalId || undefined
    });

    // Reset Form
    setNewTitle('');
    setNewImageUrl('');
    setNewThumbnailUrl('');
    setNewCategory('');
    setNewTargetDate('');
    setNewInstructions('');
    setNewGoalId('');
    setShowAddForm(false);
  };

  // Preset inspiration image selections for ease of use
  const imagePresets = [
    { name: 'Luxury House', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80' },
    { name: 'Wealth & Assets', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80' },
    { name: 'Africa Trade Hub', url: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=800&q=80' },
    { name: 'Vital Strength', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80' },
    { name: 'Global Network', url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80' }
  ];

  return (
    <div className="space-y-6 text-left animate-fade-in" id="visualization-workspace-panel">
      
      {/* Hidden File Input for high resolution image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (activeUploadCardIdRef.current) {
            handleFileUploadChange(e, activeUploadCardIdRef.current);
          } else {
            handleFileUploadChange(e);
          }
          // Reset file value to allow uploading same file again
          e.target.value = '';
        }}
      />

      {/* Upper header section */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5 ${
        isDarkMode ? 'border-white/5' : 'border-slate-200'
      }`}>
        <div>
          <h2 className={`text-3xl font-light tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Interactive <span className="font-bold text-cyan-500">Vision Board</span>
          </h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Immersive high-resolution blueprints, real-time deadlines, and live image uploads synced with your core plans.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold font-mono text-xs rounded-xl flex items-center gap-2 shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer"
        >
          {showAddForm ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Close Visualizer Setup' : 'Add Goal Photo Card'}
        </button>
      </div>

      {/* TIME I HAVE ON EARTH MAIN COUNTDOWN WIDGET */}
      <div className={`relative overflow-hidden rounded-3xl border transition-all ${
        isDarkMode 
          ? 'bg-[#0a0a12] border-cyan-500/15 shadow-[0_0_25px_rgba(6,182,212,0.05)]' 
          : 'bg-white border-slate-200 shadow-md'
      }`}>
        {/* Hidden Earth File Input */}
        <input
          type="file"
          ref={earthFileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleEarthImageUpload}
        />

        {/* Banner with Earth Image & Overlay */}
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          <img 
            src={showEarthEdit ? editEarthImage : earthCountdownImage} 
            alt="Horizon Background" 
            className="w-full h-full object-cover select-none filter brightness-[0.4]"
            referrerPolicy="no-referrer"
          />
          {/* Subtle Ambient Glow Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a12]/85 via-transparent to-[#0a0a12]/20" />
          
          {/* Live Content Overlay */}
          <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
            {/* Top row: Title and Edit button */}
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-widest flex items-center gap-1.5 drop-shadow-md">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  MEMENTO MORI ACTUARY
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md uppercase">
                  {showEarthEdit ? editEarthTitle : earthCountdownTitle}
                </h3>
                <p className="text-xs text-slate-300 italic font-serif max-w-xl drop-shadow-md leading-relaxed mt-1">
                  "{showEarthEdit ? editEarthQuote : earthCountdownQuote}"
                </p>
              </div>
              
              <button
                onClick={() => {
                  setEditEarthTitle(earthCountdownTitle);
                  setEditEarthTarget(earthCountdownTarget);
                  setEditEarthImage(earthCountdownImage);
                  setEditEarthQuote(earthCountdownQuote);
                  setShowEarthEdit(!showEarthEdit);
                }}
                className="py-1.5 px-3 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-cyan-400/40 text-white rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md"
              >
                <Settings className="w-3.5 h-3.5" />
                {showEarthEdit ? 'Hide Settings' : 'Edit Horizon'}
              </button>
            </div>

            {/* Middle/Bottom row: The Majestic Live Countdown Display */}
            <EarthCountdownLiveDisplay activeCountdownTarget={activeCountdownTarget} isDarkMode={isDarkMode} />
          </div>
        </div>

        {/* Expandable Edit Control panel */}
        <AnimatePresence>
          {showEarthEdit && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`border-t overflow-hidden ${isDarkMode ? 'bg-[#0f0f1d] border-white/5' : 'bg-slate-50 border-slate-200'}`}
            >
              <div className="p-5 md:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
                  <h4 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? 'text-cyan-400' : 'text-slate-900'}`}>
                    <Sliders className="w-4 h-4 text-cyan-500" />
                    Configure Cosmic Life Horizon Actuary
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500">
                    Target: {editEarthTarget}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Title, Quote, & Target Picker */}
                  <div className="space-y-4">
                    {/* Title input */}
                    <div className="space-y-1.5">
                      <label className={`block text-[10px] font-mono uppercase font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Display Slogan / Title
                      </label>
                      <input 
                        type="text"
                        value={editEarthTitle}
                        onChange={(e) => setEditEarthTitle(e.target.value)}
                        placeholder="Time I Have on Earth"
                        className={`w-full rounded-xl p-2.5 text-xs font-mono border outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-[#141426] border-white/5 text-slate-200 focus:border-cyan-500/40' 
                            : 'bg-white border-slate-200 text-slate-800 focus:border-cyan-500/40'
                        }`}
                      />
                    </div>

                    {/* Inspiring Quote input (Requested) */}
                    <div className="space-y-1.5">
                      <label className={`block text-[10px] font-mono uppercase font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Memento Mori Quote / Mantra
                      </label>
                      <textarea 
                        value={editEarthQuote}
                        onChange={(e) => setEditEarthQuote(e.target.value)}
                        placeholder="Remember how small you are, how precious your seconds are..."
                        rows={2}
                        className={`w-full rounded-xl p-2.5 text-xs font-mono border outline-none transition-all resize-none leading-relaxed ${
                          isDarkMode 
                            ? 'bg-[#141426] border-white/5 text-slate-200 focus:border-cyan-500/40' 
                            : 'bg-white border-slate-200 text-slate-800 focus:border-cyan-500/40'
                        }`}
                      />
                    </div>

                    {/* Exact Target Date Calendar input */}
                    <div className="space-y-1.5">
                      <label className={`block text-[10px] font-mono uppercase font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Target Horizon Date & Time
                      </label>
                      <input 
                        type="datetime-local"
                        value={editEarthTarget.slice(0, 16)} // datetime-local input takes YYYY-MM-DDTHH:mm
                        onChange={(e) => {
                          if (e.target.value) {
                            setEditEarthTarget(e.target.value + ':00');
                          }
                        }}
                        className={`w-full rounded-xl p-2.5 text-xs font-mono border outline-none transition-all cursor-pointer ${
                          isDarkMode 
                            ? 'bg-[#141426] border-white/5 text-slate-200 focus:border-cyan-500/40' 
                            : 'bg-white border-slate-200 text-slate-800 focus:border-cyan-500/40'
                        }`}
                      />
                    </div>

                    {/* Sub-inputs for custom numeric components: Year, Month, Day, Hour, Min, Sec (Requested with interactive buttons) */}
                    <div className="space-y-2 border-t border-white/5 pt-3">
                      <span className={`block text-[10px] font-mono uppercase font-bold ${isDarkMode ? 'text-cyan-500' : 'text-slate-500'}`}>
                        Option to Edit Date Components Directly
                      </span>
                      
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {/* Year */}
                        <div className="space-y-1">
                          <label className="block text-[8px] font-mono text-slate-500 uppercase text-center">Year</label>
                          <div className={`flex items-center justify-between border rounded-lg overflow-hidden ${
                            isDarkMode ? 'bg-[#141426]/60 border-white/10' : 'bg-slate-100 border-slate-200'
                          }`}>
                            <button
                              type="button"
                              onClick={() => handleComponentChange('year', targetYear - 1)}
                              className="px-1.5 py-1 text-[10px] hover:bg-cyan-500/10 text-cyan-500 font-bold transition-all cursor-pointer"
                            >
                              -
                            </button>
                            <input 
                              type="text"
                              value={targetYear}
                              onChange={(e) => handleComponentChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                              className={`w-full text-[10px] font-mono text-center bg-transparent border-0 outline-none p-0 focus:ring-0 ${
                                isDarkMode ? 'text-white' : 'text-slate-800'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleComponentChange('year', targetYear + 1)}
                              className="px-1.5 py-1 text-[10px] hover:bg-cyan-500/10 text-cyan-500 font-bold transition-all cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Month */}
                        <div className="space-y-1">
                          <label className="block text-[8px] font-mono text-slate-500 uppercase text-center">Month</label>
                          <div className={`flex items-center justify-between border rounded-lg overflow-hidden ${
                            isDarkMode ? 'bg-[#141426]/60 border-white/10' : 'bg-slate-100 border-slate-200'
                          }`}>
                            <button
                              type="button"
                              onClick={() => handleComponentChange('month', targetMonth - 1 < 1 ? 12 : targetMonth - 1)}
                              className="px-1.5 py-1 text-[10px] hover:bg-cyan-500/10 text-cyan-500 font-bold transition-all cursor-pointer"
                            >
                              -
                            </button>
                            <input 
                              type="text"
                              value={targetMonth}
                              onChange={(e) => handleComponentChange('month', Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                              className={`w-full text-[10px] font-mono text-center bg-transparent border-0 outline-none p-0 focus:ring-0 ${
                                isDarkMode ? 'text-white' : 'text-slate-800'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleComponentChange('month', targetMonth + 1 > 12 ? 1 : targetMonth + 1)}
                              className="px-1.5 py-1 text-[10px] hover:bg-cyan-500/10 text-cyan-500 font-bold transition-all cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Day */}
                        <div className="space-y-1">
                          <label className="block text-[8px] font-mono text-slate-500 uppercase text-center">Day</label>
                          <div className={`flex items-center justify-between border rounded-lg overflow-hidden ${
                            isDarkMode ? 'bg-[#141426]/60 border-white/10' : 'bg-slate-100 border-slate-200'
                          }`}>
                            <button
                              type="button"
                              onClick={() => handleComponentChange('day', targetDay - 1 < 1 ? 31 : targetDay - 1)}
                              className="px-1.5 py-1 text-[10px] hover:bg-cyan-500/10 text-cyan-500 font-bold transition-all cursor-pointer"
                            >
                              -
                            </button>
                            <input 
                              type="text"
                              value={targetDay}
                              onChange={(e) => handleComponentChange('day', Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                              className={`w-full text-[10px] font-mono text-center bg-transparent border-0 outline-none p-0 focus:ring-0 ${
                                isDarkMode ? 'text-white' : 'text-slate-800'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleComponentChange('day', targetDay + 1 > 31 ? 1 : targetDay + 1)}
                              className="px-1.5 py-1 text-[10px] hover:bg-cyan-500/10 text-cyan-500 font-bold transition-all cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Hour */}
                        <div className="space-y-1">
                          <label className="block text-[8px] font-mono text-slate-500 uppercase text-center">Hour</label>
                          <div className={`flex items-center justify-between border rounded-lg overflow-hidden ${
                            isDarkMode ? 'bg-[#141426]/60 border-white/10' : 'bg-slate-100 border-slate-200'
                          }`}>
                            <button
                              type="button"
                              onClick={() => handleComponentChange('hour', targetHour - 1 < 0 ? 23 : targetHour - 1)}
                              className="px-1.5 py-1 text-[10px] hover:bg-cyan-500/10 text-cyan-500 font-bold transition-all cursor-pointer"
                            >
                              -
                            </button>
                            <input 
                              type="text"
                              value={targetHour}
                              onChange={(e) => handleComponentChange('hour', Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                              className={`w-full text-[10px] font-mono text-center bg-transparent border-0 outline-none p-0 focus:ring-0 ${
                                isDarkMode ? 'text-white' : 'text-slate-800'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleComponentChange('hour', targetHour + 1 > 23 ? 0 : targetHour + 1)}
                              className="px-1.5 py-1 text-[10px] hover:bg-cyan-500/10 text-cyan-500 font-bold transition-all cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Minute */}
                        <div className="space-y-1">
                          <label className="block text-[8px] font-mono text-slate-500 uppercase text-center">Min</label>
                          <div className={`flex items-center justify-between border rounded-lg overflow-hidden ${
                            isDarkMode ? 'bg-[#141426]/60 border-white/10' : 'bg-slate-100 border-slate-200'
                          }`}>
                            <button
                              type="button"
                              onClick={() => handleComponentChange('minute', targetMinute - 1 < 0 ? 59 : targetMinute - 1)}
                              className="px-1.5 py-1 text-[10px] hover:bg-cyan-500/10 text-cyan-500 font-bold transition-all cursor-pointer"
                            >
                              -
                            </button>
                            <input 
                              type="text"
                              value={targetMinute}
                              onChange={(e) => handleComponentChange('minute', Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                              className={`w-full text-[10px] font-mono text-center bg-transparent border-0 outline-none p-0 focus:ring-0 ${
                                isDarkMode ? 'text-white' : 'text-slate-800'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleComponentChange('minute', targetMinute + 1 > 59 ? 0 : targetMinute + 1)}
                              className="px-1.5 py-1 text-[10px] hover:bg-cyan-500/10 text-cyan-500 font-bold transition-all cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Second */}
                        <div className="space-y-1">
                          <label className="block text-[8px] font-mono text-slate-500 uppercase text-center">Sec</label>
                          <div className={`flex items-center justify-between border rounded-lg overflow-hidden ${
                            isDarkMode ? 'bg-[#141426]/60 border-white/10' : 'bg-slate-100 border-slate-200'
                          }`}>
                            <button
                              type="button"
                              onClick={() => handleComponentChange('second', targetSecond - 1 < 0 ? 59 : targetSecond - 1)}
                              className="px-1.5 py-1 text-[10px] hover:bg-cyan-500/10 text-cyan-500 font-bold transition-all cursor-pointer"
                            >
                              -
                            </button>
                            <input 
                              type="text"
                              value={targetSecond}
                              onChange={(e) => handleComponentChange('second', Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                              className={`w-full text-[10px] font-mono text-center bg-transparent border-0 outline-none p-0 focus:ring-0 ${
                                isDarkMode ? 'text-white' : 'text-slate-800'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleComponentChange('second', targetSecond + 1 > 59 ? 0 : targetSecond + 1)}
                              className="px-1.5 py-1 text-[10px] hover:bg-cyan-500/10 text-cyan-500 font-bold transition-all cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Custom Background & Relative Offset Adder */}
                  <div className="space-y-4">
                    {/* Background image selection / preset panel */}
                    <div className="space-y-2">
                      <label className={`block text-[10px] font-mono uppercase font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Horizon Banner Background
                      </label>
                      
                      {/* Image URL input */}
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={editEarthImage}
                          onChange={(e) => setEditEarthImage(e.target.value)}
                          placeholder="Paste image link..."
                          className={`w-full rounded-xl p-2.5 text-xs font-mono border outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-[#141426] border-white/5 text-slate-200 focus:border-cyan-500/40' 
                              : 'bg-white border-slate-200 text-slate-800 focus:border-cyan-500/40'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => earthFileInputRef.current?.click()}
                          className="px-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                          title="Upload image file"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Built-in high-quality premium image presets */}
                      <div className="grid grid-cols-5 gap-1.5 pt-1">
                        {[
                          { name: 'Earth', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80' },
                          { name: 'Nebula', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80' },
                          { name: 'Aurora', url: 'https://images.unsplash.com/photo-1524260855046-f743b3cdbb07?auto=format&fit=crop&w=1200&q=80' },
                          { name: 'Cyber', url: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=1200&q=80' },
                          { name: 'Ocean', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=80' }
                        ].map(preset => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setEditEarthImage(preset.url)}
                            className={`relative h-10 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                              editEarthImage === preset.url ? 'border-cyan-400 scale-[1.03]' : 'border-white/5 hover:border-white/20'
                            }`}
                          >
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover filter brightness-[0.6]" />
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-white uppercase bg-black/40">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Relative offset calculator section */}
                    <div className="p-3.5 rounded-2xl border border-cyan-500/10 bg-cyan-500/5 space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Quick relative countdown offset (Add from Now)
                      </span>
                      <p className="text-[9px] text-slate-400 font-sans leading-relaxed">
                        Specify exact remaining duration values relative to the current live moment to compute the exact future target instantly.
                      </p>

                      <div className="grid grid-cols-4 gap-1.5">
                        <div>
                          <label className="block text-[8px] font-mono text-slate-500 uppercase">Days</label>
                          <input 
                            type="number"
                            min="0"
                            placeholder="0"
                            value={relativeDays}
                            onChange={(e) => setRelativeDays(e.target.value)}
                            className="w-full rounded-lg p-1 text-xs font-mono text-center border border-white/5 bg-slate-900 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-mono text-slate-500 uppercase">Hours</label>
                          <input 
                            type="number"
                            min="0"
                            placeholder="0"
                            value={relativeHours}
                            onChange={(e) => setRelativeHours(e.target.value)}
                            className="w-full rounded-lg p-1 text-xs font-mono text-center border border-white/5 bg-slate-900 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-mono text-slate-500 uppercase">Mins</label>
                          <input 
                            type="number"
                            min="0"
                            placeholder="0"
                            value={relativeMinutes}
                            onChange={(e) => setRelativeMinutes(e.target.value)}
                            className="w-full rounded-lg p-1 text-xs font-mono text-center border border-white/5 bg-slate-900 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-mono text-slate-500 uppercase">Secs</label>
                          <input 
                            type="number"
                            min="0"
                            placeholder="0"
                            value={relativeSeconds}
                            onChange={(e) => setRelativeSeconds(e.target.value)}
                            className="w-full rounded-lg p-1 text-xs font-mono text-center border border-white/5 bg-slate-900 text-white"
                          />
                        </div>
                      </div>

                      {relativeOffsetError && (
                        <p className="text-[9px] text-rose-400 font-mono text-center leading-normal mt-1">
                          {relativeOffsetError}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={applyRelativeOffset}
                        className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-[9px] rounded-lg tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Compute & Apply Dynamic Target
                      </button>
                    </div>
                  </div>
                </div>

                {/* Confirm Save / Discard buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditEarthTitle(earthCountdownTitle);
                      setEditEarthTarget(earthCountdownTarget);
                      setEditEarthImage(earthCountdownImage);
                      setEditEarthQuote(earthCountdownQuote);
                      setShowEarthEdit(false);
                    }}
                    className="py-2 px-4 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-mono cursor-pointer transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="button"
                    onClick={saveEarthCountdown}
                    className="py-2 px-5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold font-mono text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Horizon Changes
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add New Vision Card Form Panel */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddNewCard} className={`p-6 rounded-3xl space-y-4 mb-6 border ${
              isDarkMode ? 'glass-panel border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs uppercase tracking-wider mb-2 font-bold">
                <Sparkles className="w-4 h-4" /> Create New Visualization Anchor
              </div>

              {/* Drag and Drop Upload Dropzone Area */}
              <div className="space-y-1">
                <label className={`block text-[10px] font-mono uppercase font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Visual Goal Photo (Upload File or Paste Image URL)
                </label>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Dropzone Container */}
                  <div className="lg:col-span-2">
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          processImageFile(file);
                        }
                      }}
                      onClick={() => {
                        activeUploadCardIdRef.current = null;
                        if (fileInputRef.current) fileInputRef.current.click();
                      }}
                      className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[140px] ${
                        isDragging
                          ? 'border-cyan-400 bg-cyan-400/5 scale-[1.01]'
                          : isDarkMode
                            ? 'border-white/10 hover:border-cyan-500/40 bg-[#0d0d15] hover:bg-[#121220]'
                            : 'border-slate-300 hover:border-cyan-500/40 bg-slate-50 hover:bg-slate-100/60'
                      }`}
                    >
                      <Upload className={`w-7 h-7 mb-2 ${isDragging ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        Drag and drop your future goals photo here, or <span className="text-cyan-500 font-bold">browse device</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1.5">
                        High resolution local image files will be saved in your secure Life OS.
                      </p>
                    </div>
                  </div>

                  {/* Preview box / Manual URL input */}
                  <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    isDarkMode ? 'bg-[#09090f] border-white/15' : 'bg-slate-50/50 border-slate-200'
                  }`}>
                    <div className="flex-1 flex flex-col justify-center items-center">
                      {newImageUrl ? (
                        <div className="relative w-full h-24 rounded-xl overflow-hidden shadow-inner border border-white/5 group">
                          <img 
                            src={newImageUrl} 
                            alt="Goal Preview" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setNewImageUrl('')}
                            className="absolute top-1.5 right-1.5 p-1 bg-slate-950/80 hover:bg-rose-600 rounded-full text-white transition-colors cursor-pointer"
                            title="Remove Photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[8px] font-mono font-bold rounded-md">
                            PREVIEW LOADED
                          </span>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-1 opacity-50" />
                          <span className="text-[10px] font-mono text-slate-400 block">No Goal Photo Loaded</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Or paste image URL</span>
                      <input
                        type="text"
                        value={newImageUrl.startsWith('data:') ? 'Local Photo File Uploaded' : newImageUrl}
                        onChange={(e) => {
                          setNewImageUrl(e.target.value);
                        }}
                        disabled={newImageUrl.startsWith('data:')}
                        placeholder="e.g. https://images.unsplash.com/..."
                        className={`w-full border rounded-xl p-2 text-xs outline-none transition-colors ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/10 text-white focus:border-cyan-400' 
                            : 'bg-white border-slate-200 text-slate-800 focus:border-cyan-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Standard inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-[10px] font-mono uppercase mb-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Anchor Designation</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. MULTIPLY ENTERPRISE VALUATION"
                    className={`w-full border rounded-xl p-2.5 text-xs focus:border-cyan-400 outline-none ${
                      isDarkMode ? 'bg-[#0d0d15] border-white/10 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-[10px] font-mono uppercase mb-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Link to Core Goal</label>
                  <select
                    value={newGoalId}
                    onChange={(e) => {
                      setNewGoalId(e.target.value);
                      const matchedGoal = goals.find(g => g.id === e.target.value);
                      if (matchedGoal) {
                        setNewTitle(matchedGoal.title);
                        setNewCategory(matchedGoal.category);
                        setNewTargetDate(matchedGoal.targetDate);
                        if (matchedGoal.imageUrl) setNewImageUrl(matchedGoal.imageUrl);
                      }
                    }}
                    className={`w-full border rounded-xl p-2.5 text-xs focus:border-cyan-400 outline-none ${
                      isDarkMode ? 'bg-[#0d0d15] border-white/10 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="">-- Optional Goal Link --</option>
                    {goals.map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-[10px] font-mono uppercase mb-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Focus Sector</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Wealth Architecture"
                    className={`w-full border rounded-xl p-2.5 text-xs focus:border-cyan-400 outline-none ${
                      isDarkMode ? 'bg-[#0d0d15] border-white/10 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] font-mono uppercase mb-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Target Horizon</label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs focus:border-cyan-400 outline-none ${
                      isDarkMode ? 'bg-[#0d0d15] border-white/10 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Presets Row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Preset Blueprints:</span>
                {imagePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewImageUrl(preset.url)}
                    className={`px-2.5 py-1 text-[10px] font-mono rounded transition-all border ${
                      isDarkMode 
                        ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              <div>
                <label className={`block text-[10px] font-mono uppercase mb-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Instructions & Mantras directly to me</label>
                <textarea
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Formulate precise commands and visualizations. E.g. 'Read current ledger status, dedicate 4 deep hours, focus intently...'"
                  rows={3}
                  className={`w-full border rounded-xl p-3 text-xs focus:border-cyan-400 outline-none resize-none leading-relaxed ${
                    isDarkMode ? 'bg-[#0d0d15] border-white/10 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-950'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={`px-4 py-2 text-xs font-mono rounded-xl border ${
                    isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs rounded-xl transition-all"
                >
                  Commit Anchor Card
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Interactive Vision Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {visionCards.map((card) => {
          const isEditingMeta = editingCardId === card.id;
          const isEditingInstructions = activeInstructionsId === card.id;
          const linkedGoal = goals.find(g => g.id === card.goalId);

          return (
            <div
              key={card.id}
              className={`rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-300 border ${
                isDarkMode ? 'bg-[#0b0b12] border-white/5' : 'bg-white border-slate-200'
              }`}
              id={`vision-card-${card.id}`}
            >
              {/* Header / Image section with interactive upload trigger (Height increased for stunning display) */}
              <div className="relative h-80 sm:h-[400px] overflow-hidden group">
                
                {imageErrors[card.id] ? (
                  /* Elegant error placeholder with built-in upload click & drag-and-drop support */
                  <div 
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        processImageFile(file, card.id);
                      }
                    }}
                    onClick={() => triggerUploadClick(card.id)}
                    className={`w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors ${
                      isDarkMode ? 'bg-slate-950/95 hover:bg-slate-900/90' : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="p-3 bg-amber-500/10 rounded-full text-amber-500 mb-2">
                      <AlertCircle className="w-8 h-8 animate-pulse" />
                    </div>
                    <h4 className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      Image URL failed to load
                    </h4>
                    <p className={`text-[11px] max-w-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Some external websites block direct hotlinking (CORS protection). Please upload the photo file directly from your device instead!
                    </p>
                    <button
                      type="button"
                      onClick={() => triggerUploadClick(card.id)}
                      className="mt-3.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold rounded-xl flex items-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Photo Directly
                    </button>
                    <span className="text-[9px] text-slate-400 mt-2 font-mono">Or drag & drop photo here</span>
                  </div>
                ) : (
                  <SwipeableImageCarousel
                    images={
                      editingCardId === card.id
                        ? (tempThumbnailUrls.length > 0 ? tempThumbnailUrls : (tempImageUrl ? [tempImageUrl] : (tempImageUrls.length > 0 ? tempImageUrls : [tempImageUrl])))
                        : (card.thumbnailUrls && card.thumbnailUrls.length > 0 ? card.thumbnailUrls : (card.thumbnailUrl ? [card.thumbnailUrl] : (card.imageUrls && card.imageUrls.length > 0 ? card.imageUrls : [card.imageUrl])))
                    }
                    fullImages={
                      editingCardId === card.id
                        ? (tempImageUrls.length > 0 ? tempImageUrls : [tempImageUrl])
                        : (card.imageUrls && card.imageUrls.length > 0 ? card.imageUrls : [card.imageUrl])
                    }
                    alt={card.title}
                    onError={() => {
                      // Flag this card's image as failed so we can show the helpful uploader fallback!
                      setImageErrors(prev => ({ ...prev, [card.id]: true }));
                    }}
                  />
                )}
                
                {/* Subtle dark bottom shade overlay for visual depth */}
                <div className={`absolute inset-0 pointer-events-none bg-gradient-to-t via-transparent to-black/15 ${
                  isDarkMode ? 'from-[#0b0b12]/35' : 'from-white/5'
                }`} />

                {/* Instant upload overlay triggers (shown on hover over a working image) */}
                {!imageErrors[card.id] && (
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button
                      onClick={() => triggerUploadClick(card.id)}
                      className="p-3 bg-cyan-500/90 hover:bg-cyan-400 hover:scale-105 text-slate-950 rounded-2xl font-bold text-xs font-mono flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4" /> {uploadingCardId === card.id ? "Uploading..." : "Replace Goal Photo"}
                    </button>
                  </div>
                )}
              </div>

              {/* Editing Card Metadata Overlay */}
              <AnimatePresence>
                {isEditingMeta && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-5 space-y-3 border-b ${
                      isDarkMode ? 'bg-[#07070d] border-white/5' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest font-bold">Configure Manifest Anchor Specs</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-mono text-slate-400 block mb-0.5">Anchor Title</label>
                        <input
                          type="text"
                          value={tempTitle}
                          onChange={(e) => setTempTitle(e.target.value)}
                          className={`w-full border rounded p-1.5 text-xs focus:border-cyan-400 outline-none ${
                            isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="text-[9px] font-mono text-slate-400 block mb-0.5">Sector</label>
                        <input
                          type="text"
                          value={tempCategory}
                          onChange={(e) => setTempCategory(e.target.value)}
                          className={`w-full border rounded p-1.5 text-xs focus:border-cyan-400 outline-none ${
                            isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[9px] font-mono text-slate-400 block mb-0.5">Goal Images (Drag & Drop multiple files or paste URL)</label>
                        
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const files = e.dataTransfer.files;
                            if (files) {
                              activeUploadCardIdRef.current = card.id;
                              for (let i = 0; i < files.length; i++) {
                                const file = files.item(i);
                                if (file) {
                                  processImageFile(file, card.id);
                                }
                              }
                            }
                          }}
                          onClick={() => {
                            activeUploadCardIdRef.current = card.id;
                            if (fileInputRef.current) fileInputRef.current.click();
                          }}
                          className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                            isDarkMode 
                              ? 'border-white/10 hover:border-cyan-500/40 bg-[#0d0d15]/50' 
                              : 'border-slate-300 hover:border-cyan-500 bg-slate-50/50'
                          }`}
                        >
                          <Upload className="w-5 h-5 text-slate-400 mb-1" />
                          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                            Drag & drop files, or <span className="text-cyan-500">browse files</span>
                          </span>
                        </div>

                        {/* Thumbnail Row */}
                        {tempImageUrls.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[8px] font-mono text-slate-400 uppercase block">Selected Images ({tempImageUrls.length})</span>
                            <div className="flex flex-wrap gap-1.5 p-1.5 border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50/20 dark:bg-[#0d0d15]/40 max-h-24 overflow-y-auto">
                              {tempImageUrls.map((url, idx) => (
                                <div key={idx} className="relative w-12 h-12 rounded overflow-hidden border border-slate-200 dark:border-white/10 group bg-slate-100 dark:bg-slate-950 flex-shrink-0">
                                  <img src={url} className="w-full h-full object-cover" alt="" />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTempImageUrls(prev => prev.filter((_, i) => i !== idx));
                                      setTempThumbnailUrls(prev => prev.filter((_, i) => i !== idx));
                                      setTempImageUrl('');
                                      setTempThumbnailUrl('');
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

                        {/* Direct input with add button */}
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={editUrlInput}
                            onChange={(e) => setEditUrlInput(e.target.value)}
                            placeholder="Or paste direct image URL and click '+'"
                            className={`flex-1 border rounded p-1.5 text-xs focus:border-cyan-400 outline-none ${
                              isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (editUrlInput.trim()) {
                                setTempImageUrls(prev => [...prev, editUrlInput.trim()]);
                                setTempThumbnailUrls(prev => [...prev, editUrlInput.trim()]);
                                setEditUrlInput('');
                              }
                            }}
                            className="px-3 bg-cyan-550 hover:bg-cyan-600 text-white font-bold rounded text-xs cursor-pointer shrink-0"
                          >
                            + Add
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-mono text-slate-400 block mb-0.5">Achievement Date</label>
                        <input
                          type="date"
                          value={tempTargetDate}
                          onChange={(e) => setTempTargetDate(e.target.value)}
                          className={`w-full border rounded p-1.5 text-xs focus:border-cyan-400 outline-none ${
                            isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-mono text-slate-400 block mb-0.5">Bind to Core Goal Framework</label>
                        <select
                          value={tempGoalId}
                          onChange={(e) => setTempGoalId(e.target.value)}
                          className={`w-full border rounded p-1.5 text-xs focus:border-cyan-400 outline-none ${
                            isDarkMode ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="">-- No Link --</option>
                          {goals.map(g => (
                            <option key={g.id} value={g.id}>{g.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => setEditingCardId(null)}
                        className={`px-3 py-1 text-[10px] font-mono rounded ${
                          isDarkMode ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(card.id)}
                        className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold text-[10px] font-mono rounded"
                      >
                        Save Configuration
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Countdown & Instructions panel - DIRECTLY EDITABLE TO ME */}
              <div className="p-6 flex flex-col justify-between flex-1 space-y-5">
                
                {/* Clean non-overlay Metadata & Action controls panel */}
                <div className="space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className={`px-2.5 py-1 border text-[10px] font-mono font-semibold uppercase tracking-wider rounded-md ${
                        isDarkMode 
                          ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400' 
                          : 'bg-cyan-50 border-cyan-200 text-cyan-600'
                      }`}>
                        {card.category}
                      </span>
                      {card.targetDate && (
                        <span className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-md border ${
                          isDarkMode ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                          <Calendar className="w-3 h-3 text-cyan-400" /> Goal Target: {card.targetDate}
                        </span>
                      )}
                      {linkedGoal && (
                        <span className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-md border ${
                          isDarkMode 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        }`}>
                          <Link2 className="w-3 h-3 text-emerald-400" /> Linked to "{linkedGoal.title}"
                        </span>
                      )}
                    </div>

                    {/* Action buttons (Now beautifully separated from image) */}
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => triggerUploadClick(card.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isDarkMode 
                            ? 'bg-white/5 hover:bg-emerald-500 hover:text-slate-950 text-slate-400 border-white/5' 
                            : 'bg-slate-50 hover:bg-emerald-500 hover:text-white text-slate-500 border-slate-200'
                        }`}
                        title="Upload/Replace Goal Photo"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStartEdit(card)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isDarkMode 
                            ? 'bg-white/5 hover:bg-cyan-500 hover:text-slate-950 text-slate-400 border-white/5' 
                            : 'bg-slate-50 hover:bg-cyan-500 hover:text-white text-slate-500 border-slate-200'
                        }`}
                        title="Edit Card Configuration"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteCard(card.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isDarkMode 
                            ? 'bg-white/5 hover:bg-rose-500 hover:text-white text-slate-400 border-white/5' 
                            : 'bg-slate-50 hover:bg-rose-500 hover:text-white text-slate-500 border-slate-200'
                        }`}
                        title="Remove Manifest Anchor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Clean Prominent Title below the image */}
                  <h3 className={`text-xl sm:text-2xl font-extrabold tracking-tight leading-snug ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {card.title}
                  </h3>
                </div>
                
                {/* BIG COUNTDOWN TIMER */}
                {card.targetDate && (
                  <GoalCountdown targetDate={card.targetDate} isDarkMode={isDarkMode} />
                )}

                {/* Self command box header */}
                <div className={`flex justify-between items-center border-b pt-2 pb-2 ${
                  isDarkMode ? 'border-white/5' : 'border-slate-100'
                }`}>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> COMMAND DIRECTIVES TO MYSELF
                  </span>
                  
                  {!isEditingInstructions && (
                    <button
                      onClick={() => handleStartInstructionsEdit(card)}
                      className={`text-[10px] font-mono flex items-center gap-1 transition-colors ${
                        isDarkMode ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-500'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" /> Edit Mantras
                    </button>
                  )}
                </div>

                {/* Instructions Text block */}
                <div className="flex-1">
                  {isEditingInstructions ? (
                    <div className="space-y-3">
                      <textarea
                        value={activeInstructionsText}
                        onChange={(e) => setActiveInstructionsText(e.target.value)}
                        rows={5}
                        className={`w-full border rounded-xl p-3 text-xs outline-none resize-none leading-relaxed font-sans ${
                          isDarkMode 
                            ? 'bg-[#0d0d15] border-cyan-500/20 text-slate-100 focus:border-cyan-400' 
                            : 'bg-slate-50 border-cyan-500/30 text-slate-900 focus:border-cyan-500'
                        }`}
                        placeholder="State your absolute non-negotiable strategy for achieving this target..."
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setActiveInstructionsId(null)}
                          className={`px-3 py-1.5 text-[10px] font-mono rounded-lg ${
                            isDarkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          Discard
                        </button>
                        <button
                          onClick={() => handleSaveInstructions(card.id)}
                          className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-[10px] font-mono rounded-lg flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" /> Save Manifest
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`p-4 rounded-2xl border text-xs leading-relaxed italic relative cursor-pointer group transition-colors min-h-[100px] ${
                        isDarkMode 
                          ? 'bg-white/2 hover:bg-white/5 border-white/5 text-slate-300' 
                          : 'bg-slate-50/50 hover:bg-slate-100/50 border-slate-100 text-slate-700'
                      }`}
                      onClick={() => handleStartInstructionsEdit(card)}
                      title="Click directly to edit instructions"
                    >
                      <p className="whitespace-pre-wrap font-sans">
                        "{card.instructions}"
                      </p>
                      
                      {/* Gentle hover prompt */}
                      <span className="absolute bottom-2 right-2.5 text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        click to edit directive
                      </span>
                    </div>
                  )}
                </div>

                {/* Action steps guide footer */}
                <div className={`mt-4 pt-3 border-t flex justify-between items-center text-[9px] font-mono text-slate-500 ${
                  isDarkMode ? 'border-white/5' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Visual Core Loop Active</span>
                  </div>
                  <span>Manifest ID: {card.id}</span>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Philosophy Anchor Quote */}
      <div className={`p-5 rounded-3xl border flex flex-col md:flex-row items-center gap-4 transition-colors duration-200 ${
        isDarkMode 
          ? 'glass-panel border-cyan-500/10 bg-gradient-to-r from-cyan-950/10 to-transparent' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="text-left">
          <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest block font-bold">The Law of Manifest Execution</span>
          <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            "Your brain is a biological processor that compounds images and repetitive directives into subconscious muscle execution. By viewing these high-resolution anchors every day and writing clear, non-negotiable commands to yourself, you program your central focus to ignore distractions and realize ₹8,000 Cr magnitude achievements."
          </p>
        </div>
      </div>

    </div>
  );
}
