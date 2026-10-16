import React, { useState } from 'react';
import { Note, Folder } from '../types/note';
import { exportAllDataJSON, importAllDataJSON } from '../services/storage';
import { X, Download, Upload, Database, Check, AlertTriangle } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  notes: Note[];
  folders: Folder[];
  onClose: () => void;
  onRestore: (notes: Note[], folders: Folder[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  notes,
  folders,
  onClose,
  onRestore,
  onShowToast,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const jsonStr = exportAllDataJSON(notes, folders);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noteforge_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('JSON backup downloaded!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setImportJsonText(text);
        setErrorMsg('');
      } catch (err: any) {
        setErrorMsg('Failed to read file contents');
      }
    };
    reader.readAsText(file);
  };

  const handleApplyRestore = () => {
    if (!importJsonText.trim()) return;
    try {
      const { notes: importedNotes, folders: importedFolders } = importAllDataJSON(importJsonText);
      onRestore(importedNotes, importedFolders);
      onShowToast(`Restored ${importedNotes.length} notes & ${importedFolders.length} folders`, 'success');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse backup JSON.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Backup & Restore
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Safely export your notes as JSON or restore from a previous backup.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Export Complete Backup
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {notes.length} notes · {folders.length} folders
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Downloads a single JSON file containing all notes, folders, tags, and snapshots.
          </p>
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON Backup</span>
          </button>
        </div>

        {/* Import / Restore Section */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Restore From JSON File
          </span>

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 cursor-pointer"
            />
          </div>

          <textarea
            value={importJsonText}
            onChange={(e) => {
              setImportJsonText(e.target.value);
              setErrorMsg('');
            }}
            placeholder="Or paste backup JSON content here..."
            className="w-full h-28 p-3 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none resize-none"
          />

          {errorMsg && (
            <div className="flex items-center gap-1.5 p-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs rounded-lg border border-rose-200 dark:border-rose-900">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyRestore}
              disabled={!importJsonText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Restore Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
