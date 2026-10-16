import React, { useState, useEffect, useRef } from 'react';
import { Note, Folder, ActiveFilter, SortOption, AIActionType, ToastMessage, NoteHistorySnapshot } from './types/note';
import {
  loadNotesFromStorage,
  saveNotesToStorage,
  loadFoldersFromStorage,
  saveFoldersToStorage,
  INITIAL_NOTES
} from './services/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import { FolderModal } from './components/FolderModal';
import { BackupModal } from './components/BackupModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { NoteHistoryModal } from './components/NoteHistoryModal';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('noteforge_theme') === 'dark' ||
      (!('noteforge_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Main Data States
  const [notes, setNotes] = useState<Note[]>(loadNotesFromStorage);
  const [folders, setFolders] = useState<Folder[]>(loadFoldersFromStorage);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    const active = loadNotesFromStorage().filter((n) => !n.isTrash);
    return active.length > 0 ? active[0].id : null;
  });

  // UI States
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({ type: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updatedAt');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zenMode, setZenMode] = useState(false);

  // Modals
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | undefined>(undefined);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiActionType, setAiActionType] = useState<AIActionType | 'custom'>('summarize');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Save to localStorage on state changes
  useEffect(() => {
    saveNotesToStorage(notes);
  }, [notes]);

  useEffect(() => {
    saveFoldersToStorage(folders);
  }, [folders]);

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('noteforge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('noteforge_theme', 'light');
    }
  }, [darkMode]);

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true';

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Ctrl + N: New Note
      if (isCmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewNote();
      }

      // Ctrl + S: Force Save
      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        showToast('Auto-saved all notes!', 'success');
      }

      // Ctrl + F or / (when not focused on input)
      if ((isCmdOrCtrl && e.key.toLowerCase() === 'f') || (e.key === '/' && !isInput)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Ctrl + P: Toggle Pin
      if (isCmdOrCtrl && e.key.toLowerCase() === 'p' && activeNoteId) {
        e.preventDefault();
        handleTogglePin(activeNoteId);
      }

      // Ctrl + Shift + D: Duplicate
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'd' && activeNoteId) {
        e.preventDefault();
        handleDuplicateNote(activeNoteId);
      }

      // Ctrl + \: Toggle Sidebar
      if (isCmdOrCtrl && e.key === '\\') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }

      // Ctrl + Shift + F: Toggle Zen Mode
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setZenMode((prev) => !prev);
      }

      // ? : Keyboard Shortcuts modal
      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setShortcutsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNoteId]);

  // Active Note Object
  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  // CRUD Operations
  const handleNewNote = () => {
    const now = Date.now();
    const newNote: Note = {
      id: 'note-' + Math.random().toString(36).substring(2, 9),
      title: 'Untitled Note',
      content: '',
      folderId: activeFilter.type === 'folder' ? activeFilter.folderId : 'unfiled',
      tags: activeFilter.type === 'tag' ? [activeFilter.tag] : [],
      isPinned: false,
      isTrash: false,
      createdAt: now,
      updatedAt: now,
      history: [],
    };

    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    showToast('Created new note', 'success');
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === updatedNote.id) {
          // Keep snapshot history up to 10 entries
          const history = n.history || [];
          const lastSnap = history[0];
          let updatedHistory = history;

          // Record snapshot if 1 minute has passed or title changed
          if (!lastSnap || Date.now() - lastSnap.timestamp > 60000) {
            updatedHistory = [
              {
                id: 'snap-' + Math.random().toString(36).substring(2, 7),
                timestamp: Date.now(),
                title: n.title,
                content: n.content,
              },
              ...history.slice(0, 9),
            ];
          }

          return { ...updatedNote, history: updatedHistory };
        }
        return n;
      })
    );
  };

  const handleTogglePin = (noteId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          const nextPinned = !n.isPinned;
          showToast(nextPinned ? 'Pinned note to top' : 'Unpinned note', 'info');
          return { ...n, isPinned: nextPinned };
        }
        return n;
      })
    );
  };

  const handleDuplicateNote = (noteId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = notes.find((n) => n.id === noteId);
    if (!target) return;

    const now = Date.now();
    const dup: Note = {
      ...target,
      id: 'note-' + Math.random().toString(36).substring(2, 9),
      title: `${target.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      isPinned: false,
      history: [],
    };

    setNotes((prev) => [dup, ...prev]);
    setActiveNoteId(dup.id);
    showToast('Duplicated note', 'success');
  };

  const handleDeleteNote = (noteId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          return { ...n, isTrash: true, isPinned: false, trashedAt: Date.now() };
        }
        return n;
      })
    );

    // Switch active note if current active was trashed
    if (activeNoteId === noteId) {
      const remaining = notes.filter((n) => n.id !== noteId && !n.isTrash);
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
    }
    showToast('Moved note to Trash Bin', 'warning');
  };

  const handleRestoreNote = (noteId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          return { ...n, isTrash: false, trashedAt: undefined };
        }
        return n;
      })
    );
    setActiveNoteId(noteId);
    showToast('Restored note from Trash', 'success');
  };

  const handlePermanentDeleteNote = (noteId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Permanently delete this note? This action cannot be undone.')) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (activeNoteId === noteId) {
        setActiveNoteId(null);
      }
      showToast('Permanently deleted note', 'error');
    }
  };

  const handleEmptyTrash = () => {
    if (confirm('Empty entire Trash Bin? All items will be permanently erased.')) {
      setNotes((prev) => prev.filter((n) => !n.isTrash));
      showToast('Emptied Trash Bin', 'info');
    }
  };

  // Folder Operations
  const handleSaveFolder = (name: string, color: string, iconName: string, folderId?: string) => {
    if (folderId) {
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, name, color, iconName } : f))
      );
      showToast('Updated folder', 'success');
    } else {
      const newFolder: Folder = {
        id: 'folder-' + Math.random().toString(36).substring(2, 9),
        name,
        color,
        iconName,
        createdAt: Date.now(),
      };
      setFolders((prev) => [...prev, newFolder]);
      showToast('Created new folder', 'success');
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    // Reassign notes in deleted folder to 'unfiled'
    setNotes((prev) =>
      prev.map((n) => (n.folderId === folderId ? { ...n, folderId: 'unfiled' } : n))
    );
    if (activeFilter.type === 'folder' && activeFilter.folderId === folderId) {
      setActiveFilter({ type: 'all' });
    }
    showToast('Deleted folder and re-assigned notes', 'info');
  };

  // Apply AI Result
  const handleApplyAIResult = (
    resultContent: string,
    mode: 'replace' | 'append',
    newTags?: string[]
  ) => {
    if (!activeNote) return;

    let updatedContent = activeNote.content;
    if (mode === 'replace') {
      updatedContent = resultContent;
    } else if (mode === 'append') {
      updatedContent = `${activeNote.content}\n\n${resultContent}`;
    }

    let updatedTags = activeNote.tags;
    if (newTags && newTags.length > 0) {
      const combined = new Set([...activeNote.tags, ...newTags]);
      updatedTags = Array.from(combined);
    }

    const updatedNote: Note = {
      ...activeNote,
      content: updatedContent,
      tags: updatedTags,
      updatedAt: Date.now(),
    };

    handleUpdateNote(updatedNote);
  };

  // Revert Snapshot
  const handleRevertSnapshot = (snap: NoteHistorySnapshot) => {
    if (!activeNote) return;
    const updatedNote: Note = {
      ...activeNote,
      title: snap.title,
      content: snap.content,
      updatedAt: Date.now(),
    };
    handleUpdateNote(updatedNote);
    showToast('Reverted note to selected version', 'success');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none">
      {/* Top Header Bar */}
      {!zenMode && (
        <Header
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewNote={handleNewNote}
          zenMode={zenMode}
          onToggleZenMode={() => setZenMode(!zenMode)}
          onOpenBackupModal={() => setBackupModalOpen(true)}
          onOpenShortcutsModal={() => setShortcutsModalOpen(true)}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          searchInputRef={searchInputRef}
        />
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar */}
        {!zenMode && (
          <Sidebar
            notes={notes}
            folders={folders}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            onOpenFolderModal={(f) => {
              setEditingFolder(f);
              setFolderModalOpen(true);
            }}
            onDeleteFolder={handleDeleteFolder}
            onEmptyTrash={handleEmptyTrash}
            isOpen={sidebarOpen}
            onCloseMobile={() => setSidebarOpen(false)}
          />
        )}

        {/* Master Note List Panel */}
        {!zenMode && (
          <NoteList
            notes={notes}
            folders={folders}
            activeNoteId={activeNoteId}
            onSelectNote={setActiveNoteId}
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onNewNote={handleNewNote}
            onTogglePin={handleTogglePin}
            onDuplicateNote={handleDuplicateNote}
            onDeleteNote={handleDeleteNote}
            onRestoreNote={handleRestoreNote}
            onPermanentDeleteNote={handlePermanentDeleteNote}
          />
        )}

        {/* Detail Note Workspace Editor */}
        <NoteEditor
          note={activeNote}
          folders={folders}
          onUpdateNote={handleUpdateNote}
          onDuplicateNote={handleDuplicateNote}
          onDeleteNote={handleDeleteNote}
          onOpenAIModal={(type) => {
            setAiActionType(type);
            setAiModalOpen(true);
          }}
          onOpenHistoryModal={() => setHistoryModalOpen(true)}
          onShowToast={showToast}
        />
      </div>

      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold text-white transition-all animate-in slide-in-from-bottom-3 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-600'
                : toast.type === 'error'
                ? 'bg-rose-600'
                : toast.type === 'warning'
                ? 'bg-amber-600'
                : 'bg-slate-800 dark:bg-slate-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
            <span>{toast.text}</span>
          </div>
        ))}
      </div>

      {/* Folder Create/Edit Modal */}
      <FolderModal
        isOpen={folderModalOpen}
        folder={editingFolder}
        onClose={() => setFolderModalOpen(false)}
        onSave={handleSaveFolder}
        onDelete={handleDeleteFolder}
      />

      {/* JSON Backup & Restore Modal */}
      <BackupModal
        isOpen={backupModalOpen}
        notes={notes}
        folders={folders}
        onClose={() => setBackupModalOpen(false)}
        onRestore={(importedNotes, importedFolders) => {
          setNotes(importedNotes);
          setFolders(importedFolders);
          if (importedNotes.length > 0) setActiveNoteId(importedNotes[0].id);
        }}
        onShowToast={showToast}
      />

      {/* Keyboard Shortcuts Reference Modal */}
      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      {/* Server-Side Gemini AI Modal */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        actionType={aiActionType}
        note={activeNote}
        onClose={() => setAiModalOpen(false)}
        onApplyResult={handleApplyAIResult}
        onShowToast={showToast}
      />

      {/* Note Revision Snapshots History Modal */}
      <NoteHistoryModal
        isOpen={historyModalOpen}
        note={activeNote}
        onClose={() => setHistoryModalOpen(false)}
        onRevertSnapshot={handleRevertSnapshot}
      />
    </div>
  );
}
