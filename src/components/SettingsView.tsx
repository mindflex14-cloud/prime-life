import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  ShieldAlert, 
  Download, 
  Upload, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  FolderOpen,
  X,
  Compass
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
  onExportData: () => void;
  onImportData: (json: string) => boolean;
  onClearData: () => void;
  navItems: { id: string; label: string }[];
  onUpdateNavItems: (items: { id: string; label: string }[]) => void;
  isDarkMode: boolean;
}

export default function SettingsView({
  profile,
  updateProfile,
  onExportData,
  onImportData,
  onClearData,
  navItems,
  onUpdateNavItems,
  isDarkMode
}: SettingsViewProps) {
  const [name, setName] = useState(profile.name);
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showResetNavConfirm, setShowResetNavConfirm] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfile({
      ...profile,
      name
    });
    alert('User profile settings updated successfully.');
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onImportData(importJson);
    if (success) {
      setImportStatus('success');
      setImportJson('');
      setTimeout(() => setImportStatus('idle'), 3000);
    } else {
      setImportStatus('error');
      setImportJson('');
      setTimeout(() => setImportStatus('idle'), 3000);
    }
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...navItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    // Swap items
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    
    onUpdateNavItems(newItems);
  };

  const handleRenameItem = (id: string, newLabel: string) => {
    const newItems = navItems.map(item => 
      item.id === id ? { ...item, label: newLabel } : item
    );
    onUpdateNavItems(newItems);
  };

  const confirmResetNavItems = () => {
    const DEFAULT_NAV_ITEMS = [
      { id: 'dashboard', label: 'DASHBOARD' },
      { id: 'newme', label: 'UNSTOPPABLE ME' },
      { id: 'vision', label: 'VISION BOARD' },
      { id: 'goals', label: 'GOALS & PLANS' },
      { id: 'productivity', label: 'PRODUCTIVITY' },
      { id: 'logs', label: 'LOGS & JOURNAL' },
      { id: 'vitals', label: 'VITALS & WEALTH' },
      { id: 'calendar', label: 'CALENDAR' },
      { id: 'settings', label: 'SETTINGS' }
    ];
    onUpdateNavItems(DEFAULT_NAV_ITEMS);
    setShowResetNavConfirm(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left relative" id="settings-workspace-panel">
      
      {/* Profile and Configuration settings */}
      <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col justify-between border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0b14]/50" id="settings-profile-config">
        <div>
          <h3 className="text-sm font-display font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-4">
            <User className="w-4 h-4 text-cyan-400" /> User Profile Specification
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold block mb-1">User Display Designation</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aether Builder"
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg p-2.5 text-xs focus:border-cyan-400 outline-none transition-all"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              Update User Specs
            </button>
          </form>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 mt-6 text-[10px] font-mono text-slate-500">
          <p>Application context parameters are evaluated client-side. No credentials, tokens, or personal indexes are forwarded to server routes.</p>
        </div>
      </div>

      {/* Data Backup, Import, and Export Operations */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6 border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0b14]/50" id="settings-data-management">
        <div>
          <h3 className="text-sm font-display font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-cyan-400" /> Local Storage Backup Framework
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Export, transfer, or restore your entire Life OS dashboard status.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Export card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Export Ledger State</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Save a self-contained backup file (`goal_execution_life_os.json`) containing all your goals, habits, learning cards, and logs.
              </p>
            </div>
            <button 
              onClick={onExportData}
              className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Save JSON Backup
            </button>
          </div>

          {/* Import card */}
          <form onSubmit={handleImport} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Import Ledger State</h4>
              <textarea 
                placeholder="Paste backup JSON raw code here..."
                rows={3}
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1.5 text-[10px] font-mono text-cyan-600 dark:text-cyan-400 mt-2 outline-none focus:border-cyan-400 resize-none"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer font-bold"
            >
              <Upload className="w-3.5 h-3.5" /> Restore Backup
            </button>

            {importStatus === 'success' && (
              <p className="text-[10px] font-mono text-emerald-500 dark:text-emerald-400 text-center font-bold">✓ Backup restored successfully!</p>
            )}
            {importStatus === 'error' && (
              <p className="text-[10px] font-mono text-rose-500 dark:text-rose-400 text-center font-bold">❌ Invalid JSON payload reference.</p>
            )}
          </form>

        </div>

        {/* Navigation Directory Reordering & Renaming */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FolderOpen className="w-4.5 h-4.5 text-cyan-400" />
              Manage Navigation Directory Layout
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Rearrange the order of your workspace tabs or customize their names to fit your personal workflow.
            </p>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {navItems.map((item, index) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between gap-3 bg-white dark:bg-slate-950/40 p-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700/40 transition-all"
              >
                {/* Reorder & Label */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveItem(index, 'up')}
                      className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        index === 0 ? 'opacity-30 cursor-not-allowed text-slate-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                      }`}
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === navItems.length - 1}
                      onClick={() => handleMoveItem(index, 'down')}
                      className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        index === navItems.length - 1 ? 'opacity-30 cursor-not-allowed text-slate-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                      }`}
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Section Label Rename input */}
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleRenameItem(item.id, e.target.value)}
                    className="bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-800 focus:border-cyan-500/50 focus:bg-white dark:focus:bg-slate-950/60 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 py-1 px-2 rounded focus:outline-none transition-all flex-1"
                    title="Rename Section"
                  />
                </div>

                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600 uppercase font-bold pr-1 select-none">
                  {item.id}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowResetNavConfirm(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-700 dark:border-slate-800 text-slate-200 dark:text-slate-400 hover:text-white dark:hover:text-slate-200 text-[10px] font-mono font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Navigation Defaults
            </button>
          </div>
        </div>

        {/* Clear/Reset Data destructive zone */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-5">
          <div className="p-4 bg-rose-500/5 border border-rose-500/15 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h4 className="text-xs font-bold text-rose-500 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" /> Destructive Operational Zone
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Clearing local storage data instantly wipes out all profile configurations, habits, history charts, journals, and health matrices. This action is irreversible.
              </p>
            </div>

            <button 
              onClick={() => setShowClearDataConfirm(true)}
              className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs font-mono rounded-xl shrink-0 transition-all shadow cursor-pointer"
            >
              Clear Storage Ledger
            </button>
          </div>
        </div>

      </div>

      {/* --- CONFIRMATION MODALS --- */}
      <AnimatePresence>
        {/* Reset Navigation Confirm */}
        {showResetNavConfirm && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-transparent" onClick={() => setShowResetNavConfirm(false)} />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`relative w-full max-w-sm border rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 text-center z-10 ${
                isDarkMode ? 'bg-[#161622] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="py-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3">
                  <RotateCcw className="w-6 h-6 animate-spin-slow" />
                </div>
                <h3 className="text-base font-bold">Reset Navigation Layout?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  This will reset all workspace section reorderings and custom names back to default settings.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetNavConfirm(false)}
                  className={`py-3 font-semibold rounded-2xl text-xs font-mono transition-all cursor-pointer ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmResetNavItems}
                  className="py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl text-xs font-mono transition-all cursor-pointer shadow-md shadow-cyan-500/10"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Clear Storage Ledger Confirm */}
        {showClearDataConfirm && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-slate-950/85 backdrop-blur-sm">
            <div className="absolute inset-0 bg-transparent" onClick={() => setShowClearDataConfirm(false)} />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`relative w-full max-w-sm border rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 text-center z-10 ${
                isDarkMode ? 'bg-[#161622] border-rose-500/10 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="py-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-3">
                  <Trash2 className="w-6 h-6 text-rose-500 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-rose-500 dark:text-rose-400">Erase Personal Ledger?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  This action is irreversible. All profile logs, local and cloud habit streaking, journal files, and progress metrics will be permanently deleted.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearDataConfirm(false)}
                  className={`py-3 font-semibold rounded-2xl text-xs font-mono transition-all cursor-pointer ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearData();
                    setShowClearDataConfirm(false);
                  }}
                  className="py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs font-mono transition-all cursor-pointer shadow-md shadow-rose-500/20"
                >
                  Erase Everything
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
