import React from 'react';
import {
  Notebook,
  Plus,
  Search,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Database,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNewNote: () => void;
  zenMode: boolean;
  onToggleZenMode: () => void;
  onOpenBackupModal: () => void;
  onOpenShortcutsModal: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
  onNewNote,
  zenMode,
  onToggleZenMode,
  onOpenBackupModal,
  onOpenShortcutsModal,
  sidebarOpen,
  onToggleSidebar,
  searchInputRef,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 h-14 px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Zone 1: Mobile Sidebar Toggle + Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={sidebarOpen ? 'Hide Sidebar (Ctrl+\\)' : 'Show Sidebar (Ctrl+\\)'}
          aria-label="Toggle Navigation Sidebar"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2 select-none">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm font-semibold">
            <Notebook className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            NoteForge
          </span>
        </div>
      </div>

      {/* Zone 2: Live Search Input */}
      <div className="flex-1 max-w-md mx-2">
        <div className="relative flex items-center w-full">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes, tags, content... (/)"
            className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-lg border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-700/60 rounded">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Zone 3: Actions (Zen, Backup, Theme, Shortcuts, New Note) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onToggleZenMode}
          className={`p-2 rounded-lg text-xs font-medium transition-colors ${
            zenMode
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Toggle Focus / Zen Mode (Ctrl+Shift+F)"
        >
          {zenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenBackupModal}
          className="hidden sm:flex p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Backup & Restore (JSON)"
        >
          <Database className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenShortcutsModal}
          className="hidden sm:flex p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Light / Dark Mode"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <button
          onClick={onNewNote}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">New Note</span>
        </button>
      </div>
    </header>
  );
};
