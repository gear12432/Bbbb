import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Cmd/Ctrl + N', desc: 'Create a new note' },
  { key: 'Cmd/Ctrl + S', desc: 'Trigger auto-save immediately' },
  { key: 'Cmd/Ctrl + F', desc: 'Jump to Search field' },
  { key: 'Cmd/Ctrl + P', desc: 'Pin / Unpin active note' },
  { key: 'Cmd/Ctrl + Shift + D', desc: 'Duplicate active note' },
  { key: 'Cmd/Ctrl + \\', desc: 'Toggle Navigation Sidebar' },
  { key: 'Cmd/Ctrl + Shift + F', desc: 'Toggle Zen / Focus Mode' },
  { key: 'Cmd/Ctrl + B', desc: 'Bold text formatting' },
  { key: 'Cmd/Ctrl + I', desc: 'Italic text formatting' },
  { key: 'Tab', desc: 'Indent text inside editor' },
  { key: '?', desc: 'Open this Keyboard Shortcuts menu' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {SHORTCUTS.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs font-medium"
            >
              <span className="text-slate-700 dark:text-slate-300">{s.desc}</span>
              <kbd className="px-2 py-1 font-mono text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded border border-slate-300 dark:border-slate-600 shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
