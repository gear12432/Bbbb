import React, { useState } from 'react';
import { Note, NoteHistorySnapshot } from '../types/note';
import { MarkdownViewer } from './MarkdownViewer';
import { X, History, RotateCcw, Clock } from 'lucide-react';

interface NoteHistoryModalProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onRevertSnapshot: (snapshot: NoteHistorySnapshot) => void;
}

export const NoteHistoryModal: React.FC<NoteHistoryModalProps> = ({
  isOpen,
  note,
  onClose,
  onRevertSnapshot,
}) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<NoteHistorySnapshot | null>(null);

  if (!isOpen || !note) return null;

  const historyList = note.history || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Note Revision History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View previous automatic draft snapshots and restore to any version
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

        {/* Content */}
        <div className="flex-1 flex gap-4 overflow-hidden min-h-[300px]">
          {/* History List */}
          <div className="w-60 overflow-y-auto space-y-1.5 border-r border-slate-200 dark:border-slate-800 pr-2 shrink-0">
            {historyList.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 text-center">
                No previous snapshots saved yet.
              </p>
            ) : (
              historyList.map((snap) => (
                <button
                  key={snap.id}
                  onClick={() => setSelectedSnapshot(snap)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                    selectedSnapshot?.id === snap.id
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 font-medium'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(snap.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-1">
                    {snap.title || 'Untitled'}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Snapshot Preview */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
            {selectedSnapshot ? (
              <div className="space-y-3">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedSnapshot.title}
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(selectedSnapshot.timestamp).toLocaleString()}
                  </span>
                </div>
                <MarkdownViewer content={selectedSnapshot.content} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400 italic">
                Select a revision snapshot from the left list to preview...
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 shrink-0 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (selectedSnapshot) {
                onRevertSnapshot(selectedSnapshot);
                onClose();
              }
            }}
            disabled={!selectedSnapshot}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Revert to Selected Version</span>
          </button>
        </div>
      </div>
    </div>
  );
};
