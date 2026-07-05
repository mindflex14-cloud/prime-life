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
  X
} from 'lucide-react';
import { VisionCard, Goal } from '../types';

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

interface VisualizationViewProps {
  visionCards: VisionCard[];
  goals: Goal[];
  onAddCard: (card: Omit<VisionCard, 'id'>) => void;
  onUpdateCard: (id: string, updates: Partial<VisionCard>) => void;
  onDeleteCard: (id: string) => void;
  isDarkMode?: boolean;
}

export default function VisualizationView({
  visionCards,
  goals,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  isDarkMode = true
}: VisualizationViewProps) {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [tempCategory, setTempCategory] = useState('');
  const [tempTargetDate, setTempTargetDate] = useState('');
  const [tempGoalId, setTempGoalId] = useState('');
  
  // States for adding a new vision board card
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
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
    setTempCategory(card.category);
    setTempTargetDate(card.targetDate || '');
    setTempGoalId(card.goalId || '');
  };

  const handleSaveEdit = (id: string) => {
    onUpdateCard(id, {
      title: tempTitle,
      imageUrl: tempImageUrl,
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
    const reader = new FileReader();
    
    if (cardId) {
      setUploadingCardId(cardId);
    }

    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (cardId) {
        onUpdateCard(cardId, { imageUrl: base64String });
        setImageErrors(prev => ({ ...prev, [cardId]: false }));
        setUploadingCardId(null);
      } else {
        setNewImageUrl(base64String);
      }
    };
    reader.onerror = () => {
      alert("Error reading file");
      setUploadingCardId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>, cardId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, cardId);
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

    onAddCard({
      title: newTitle,
      imageUrl: imgUrl,
      category: newCategory || 'Personal Manifest',
      targetDate: newTargetDate || undefined,
      instructions: newInstructions.trim() || 'Add your visual reminders, action guides, and strategic declarations here.',
      goalId: newGoalId || undefined
    });

    // Reset Form
    setNewTitle('');
    setNewImageUrl('');
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
              {/* Header / Image section with interactive upload trigger */}
              <div className="relative h-64 overflow-hidden group">
                
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
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={() => {
                      // Flag this card's image as failed so we can show the helpful uploader fallback!
                      setImageErrors(prev => ({ ...prev, [card.id]: true }));
                    }}
                  />
                )}
                
                {/* Visual Glass gradient shade overlay */}
                <div className={`absolute inset-0 pointer-events-none bg-gradient-to-t via-transparent to-black/45 ${
                  isDarkMode ? 'from-[#0b0b12]' : 'from-white/10'
                }`} />

                {/* Instant upload overlay triggers (shown on hover over a working image) */}
                {!imageErrors[card.id] && (
                  <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                    <button
                      onClick={() => triggerUploadClick(card.id)}
                      className="p-3 bg-cyan-500/90 hover:bg-cyan-400 hover:scale-105 text-slate-950 rounded-2xl font-bold text-xs font-mono flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4" /> {uploadingCardId === card.id ? "Uploading..." : "Replace Goal Photo"}
                    </button>
                  </div>
                )}

                {/* Categories & Floating Actions */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="flex flex-col gap-1.5 items-start">
                    <span className="px-3 py-1 bg-slate-950/85 backdrop-blur-md border border-white/10 text-cyan-400 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full">
                      {card.category}
                    </span>
                    {card.targetDate && (
                      <span className="flex items-center gap-1.5 text-[9px] font-mono text-white bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/5">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Goal Target: {card.targetDate}
                      </span>
                    )}
                    {linkedGoal && (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded-md border border-emerald-500/10">
                        <Link2 className="w-3 h-3 text-emerald-400" /> Linked to "{linkedGoal.title}"
                      </span>
                    )}
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => triggerUploadClick(card.id)}
                      className="p-1.5 bg-slate-950/85 backdrop-blur-md hover:bg-emerald-500 hover:text-slate-950 text-slate-300 rounded-lg border border-white/10 transition-all cursor-pointer"
                      title="Upload/Replace Goal Photo"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(card)}
                      className="p-1.5 bg-slate-950/85 backdrop-blur-md hover:bg-cyan-500 hover:text-slate-950 text-slate-300 rounded-lg border border-white/10 transition-all cursor-pointer"
                      title="Edit Card Configuration"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCard(card.id)}
                      className="p-1.5 bg-slate-950/85 backdrop-blur-md hover:bg-rose-500 hover:text-white text-slate-300 rounded-lg border border-white/10 transition-all cursor-pointer"
                      title="Remove Manifest Anchor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Visual Overlay: Heading Text inside Image */}
                <div className="absolute bottom-4 left-5 right-5 z-10">
                  <h3 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
                    {card.title}
                  </h3>
                </div>
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

                      <div className="md:col-span-2">
                        <label className="text-[9px] font-mono text-slate-400 block mb-1">Goal Image (Paste URL or Upload File)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={tempImageUrl.startsWith('data:') ? 'Local Image File Attached ✓' : tempImageUrl}
                            onChange={(e) => {
                              setTempImageUrl(e.target.value);
                              setImageErrors(prev => ({ ...prev, [card.id]: false }));
                            }}
                            placeholder="Paste direct image link URL"
                            className={`flex-1 border rounded p-1.5 text-xs focus:border-cyan-400 outline-none text-left truncate ${
                              isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                            disabled={tempImageUrl.startsWith('data:')}
                          />
                          {tempImageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setTempImageUrl('');
                                setImageErrors(prev => ({ ...prev, [card.id]: false }));
                              }}
                              className="px-2 bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 rounded text-xs transition-colors"
                              title="Clear Image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              activeUploadCardIdRef.current = card.id;
                              if (fileInputRef.current) fileInputRef.current.click();
                            }}
                            className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-xs font-mono flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Upload className="w-3.5 h-3.5" /> Upload File
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
              <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                
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
