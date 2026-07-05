import React, { useState } from 'react';
import { User, ShieldAlert, Sparkles, Download, Upload, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, RotateCcw, FolderOpen } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
  onExportData: () => void;
  onImportData: (json: string) => boolean;
  onClearData: () => void;
  navItems: { id: string; label: string }[];
  onUpdateNavItems: (items: { id: string; label: string }[]) => void;
}

export default function SettingsView({
  profile,
  updateProfile,
  onExportData,
  onImportData,
  onClearData,
  navItems,
  onUpdateNavItems
}: SettingsViewProps) {
  const [name, setName] = useState(profile.name);
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  const handleResetNavItems = () => {
    if (confirm("Reset the navigation tab order and section names to original factory settings?")) {
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
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left" id="settings-workspace-panel">
      
      {/* Profile and Configuration settings */}
      <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col justify-between" id="settings-profile-config">
        <div>
          <h3 className="text-sm font-display font-medium text-slate-200 flex items-center gap-1.5 mb-4">
            <User className="w-4 h-4 text-cyan-400" /> User Profile Specification
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">User Display Designation</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aether Builder"
                className="w-full bg-slate-900/60 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs focus:border-cyan-400 outline-none"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs rounded-xl shadow transition-all"
            >
              Update User Specs
            </button>
          </form>
        </div>

        <div className="border-t border-slate-800/80 pt-4 mt-6 text-xs text-slate-400">
          <p>Application context parameters are evaluated client-side. No credentials, tokens, or personal indexes are forwarded to server routes.</p>
        </div>
      </div>

      {/* Data Backup, Import, and Export Operations */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6" id="settings-data-management">
        <div>
          <h3 className="text-sm font-display font-medium text-slate-200 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-cyan-400" /> Local Storage Backup Framework
          </h3>
          <p className="text-xs text-slate-400 mt-1">Export, transfer, or restore your entire Life OS dashboard status.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Export card */}
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Export Ledger State</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Save a self-contained backup file (`goal_execution_life_os.json`) containing all your goals, habits, learning cards, and logs.
              </p>
            </div>
            <button 
              onClick={onExportData}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Save JSON Backup
            </button>
          </div>

          {/* Import card */}
          <form onSubmit={handleImport} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Import Ledger State</h4>
              <textarea 
                placeholder="Paste backup JSON raw code here..."
                rows={3}
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-[10px] font-mono text-cyan-400 mt-2 outline-none focus:border-cyan-400 resize-none"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" /> Restore Backup
            </button>

            {importStatus === 'success' && (
              <p className="text-[10px] font-mono text-emerald-400 text-center font-bold">✓ Backup restored successfully!</p>
            )}
            {importStatus === 'error' && (
              <p className="text-[10px] font-mono text-rose-400 text-center font-bold">❌ Invalid JSON payload reference.</p>
            )}
          </form>

        </div>

        {/* Navigation Directory Reordering & Renaming */}
        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <FolderOpen className="w-4.5 h-4.5 text-cyan-400" />
              Manage Navigation Directory Layout
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Rearrange the order of your workspace tabs or customize their names to fit your personal workflow.
            </p>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {navItems.map((item, index) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between gap-3 bg-slate-950/40 p-2 px-3 rounded-lg border border-slate-800/60 hover:border-slate-700/40 transition-all"
              >
                {/* Reorder & Label */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveItem(index, 'up')}
                      className={`p-1 rounded hover:bg-slate-850 transition-colors ${
                        index === 0 ? 'opacity-30 cursor-not-allowed text-slate-600' : 'text-slate-400 hover:text-white cursor-pointer'
                      }`}
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === navItems.length - 1}
                      onClick={() => handleMoveItem(index, 'down')}
                      className={`p-1 rounded hover:bg-slate-850 transition-colors ${
                        index === navItems.length - 1 ? 'opacity-30 cursor-not-allowed text-slate-600' : 'text-slate-400 hover:text-white cursor-pointer'
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
                    className="bg-transparent border border-transparent hover:border-slate-800 focus:border-cyan-500/50 focus:bg-slate-950/60 text-xs font-mono font-bold text-slate-100 py-1 px-2 rounded focus:outline-none transition-all flex-1"
                    title="Rename Section"
                  />
                </div>

                <span className="text-[10px] font-mono text-slate-600 uppercase font-bold pr-1 select-none">
                  {item.id}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleResetNavItems}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-mono font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Navigation Defaults
            </button>
          </div>
        </div>

        {/* Clear/Reset Data destructive zone */}
        <div className="border-t border-slate-800/80 pt-5">
          <div className="p-4 bg-rose-500/5 border border-rose-500/15 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" /> Destructive Operational Zone
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Clearing local storage data instantly wipes out all profile configurations, habits, history charts, journals, and health matrices. This action is irreversible.
              </p>
            </div>

            <button 
              onClick={onClearData}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold text-xs font-mono rounded-xl shrink-0 transition-all shadow"
            >
              Clear Storage Ledger
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
