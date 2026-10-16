import React, { useState, useEffect } from 'react';
import { Folder } from '../types/note';
import { X, Folder as FolderIcon, Briefcase, User, BookOpen, Code, Sparkles, Check } from 'lucide-react';

interface FolderModalProps {
  isOpen: boolean;
  folder?: Folder;
  onClose: () => void;
  onSave: (name: string, color: string, iconName: string, folderId?: string) => void;
  onDelete?: (folderId: string) => void;
}

const COLOR_OPTIONS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#64748b', // slate
];

const ICON_OPTIONS = [
  { name: 'Folder', Icon: FolderIcon },
  { name: 'Briefcase', Icon: Briefcase },
  { name: 'User', Icon: User },
  { name: 'BookOpen', Icon: BookOpen },
  { name: 'Code', Icon: Code },
  { name: 'Sparkles', Icon: Sparkles },
];

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  folder,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [iconName, setIconName] = useState('Folder');

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setColor(folder.color || '#3b82f6');
      setIconName(folder.iconName || 'Folder');
    } else {
      setName('');
      setColor('#3b82f6');
      setIconName('Folder');
    }
  }, [folder, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), color, iconName, folder?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {folder ? 'Edit Folder' : 'Create New Folder'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {/* Folder Name */}
          <div className="space-y-1">
            <label className="text-slate-600 dark:text-slate-400">Folder Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work, Ideas, Travel..."
              required
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-600 dark:text-slate-400">Folder Color</label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-600 dark:text-slate-400">Folder Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS.map(({ name: itemIconName, Icon }) => (
                <button
                  key={itemIconName}
                  type="button"
                  onClick={() => setIconName(itemIconName)}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                    iconName === itemIconName
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {folder && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete folder "${folder.name}"? Notes will be moved to Unfiled.`)) {
                    onDelete(folder.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                Delete Folder
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg shadow-sm transition-all"
              >
                {folder ? 'Update Folder' : 'Create Folder'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
