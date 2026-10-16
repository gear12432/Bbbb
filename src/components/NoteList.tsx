import React from 'react';
import { Note, Folder, ActiveFilter, SortOption } from '../types/note';
import {
  Pin,
  Trash2,
  Copy,
  RotateCcw,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  Tag,
  Folder as FolderIcon,
  Clock,
  Sparkles
} from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  folders: Folder[];
  activeNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  activeFilter: ActiveFilter;
  searchQuery: string;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onNewNote: () => void;
  onTogglePin: (noteId: string, e: React.MouseEvent) => void;
  onDuplicateNote: (noteId: string, e: React.MouseEvent) => void;
  onDeleteNote: (noteId: string, e: React.MouseEvent) => void;
  onRestoreNote: (noteId: string, e: React.MouseEvent) => void;
  onPermanentDeleteNote: (noteId: string, e: React.MouseEvent) => void;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  folders,
  activeNoteId,
  onSelectNote,
  activeFilter,
  searchQuery,
  sortBy,
  onSortChange,
  onNewNote,
  onTogglePin,
  onDuplicateNote,
  onDeleteNote,
  onRestoreNote,
  onPermanentDeleteNote,
}) => {
  const [layoutMode, setLayoutMode] = React.useState<'list' | 'grid'>('list');

  // Filter notes based on activeFilter and searchQuery
  const filteredNotes = notes.filter((note) => {
    // Trash filter handling
    if (activeFilter.type === 'trash') {
      if (!note.isTrash) return false;
    } else {
      if (note.isTrash) return false;
    }

    // Specific filters
    if (activeFilter.type === 'pinned' && !note.isPinned) return false;
    if (activeFilter.type === 'folder' && note.folderId !== activeFilter.folderId) return false;
    if (activeFilter.type === 'tag' && !note.tags.includes(activeFilter.tag)) return false;

    // Search Query matching title, content, or tags
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = note.title.toLowerCase().includes(q);
      const contentMatch = note.content.toLowerCase().includes(q);
      const tagMatch = note.tags.some((t) => t.toLowerCase().includes(q));
      return titleMatch || contentMatch || tagMatch;
    }

    return true;
  });

  // Sort notes
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // Always keep pinned items on top if not viewing Trash or sorting explicitly by title
    if (activeFilter.type !== 'trash' && sortBy.startsWith('updated')) {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
    }

    switch (sortBy) {
      case 'updatedAt':
        return b.updatedAt - a.updatedAt;
      case 'createdAt':
        return b.createdAt - a.createdAt;
      case 'titleAsc':
        return a.title.localeCompare(b.title);
      case 'titleDesc':
        return b.title.localeCompare(a.title);
      default:
        return b.updatedAt - a.updatedAt;
    }
  });

  const getFolder = (folderId: string) => folders.find((f) => f.id === folderId);

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getFilterTitle = () => {
    switch (activeFilter.type) {
      case 'all':
        return 'All Notes';
      case 'pinned':
        return 'Pinned Notes';
      case 'trash':
        return 'Trash Bin';
      case 'folder': {
        const f = getFolder(activeFilter.folderId);
        return f ? `Folder: ${f.name}` : 'Folder Notes';
      }
      case 'tag':
        return `Tag: #${activeFilter.tag}`;
      default:
        return 'Notes';
    }
  };

  // Helper to strip markdown symbols for card preview text
  const getPreviewText = (content: string) => {
    if (!content) return 'No additional text...';
    return content
      .replace(/#+\s+/g, '')
      .replace(/[*_~`>|-]+/g, ' ')
      .replace(/\[[ x]\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 h-full overflow-hidden select-none">
      {/* Note List Header Controls */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {getFilterTitle()}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {sortedNotes.length} {sortedNotes.length === 1 ? 'note' : 'notes'} found
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                layoutMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                layoutMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium pl-2.5 pr-6 py-1.5 rounded-lg border border-transparent focus:outline-none cursor-pointer"
            >
              <option value="updatedAt">Modified</option>
              <option value="createdAt">Created</option>
              <option value="titleAsc">Name (A-Z)</option>
              <option value="titleDesc">Name (Z-A)</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Note List Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sortedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No notes found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              {searchQuery
                ? `No notes match "${searchQuery}"`
                : 'Create a new note to start capturing your ideas!'}
            </p>
            {activeFilter.type !== 'trash' && (
              <button
                onClick={onNewNote}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Note</span>
              </button>
            )}
          </div>
        ) : (
          <div className={layoutMode === 'grid' ? 'grid grid-cols-1 gap-2' : 'space-y-1.5'}>
            {sortedNotes.map((note) => {
              const folder = getFolder(note.folderId);
              const isActive = note.id === activeNoteId;

              return (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500/50 shadow-xs ring-1 ring-blue-500/30'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {/* Top Note Metadata: Folder, Pin & Date */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {folder && (
                        <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                          <FolderIcon className="w-3 h-3" style={{ color: folder.color }} />
                          <span className="truncate">{folder.name}</span>
                        </span>
                      )}
                      {folder && <span aria-hidden="true">·</span>}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(note.updatedAt)}</span>
                      </span>
                    </div>

                    {/* Pin indicator or toggle */}
                    {activeFilter.type !== 'trash' && (
                      <button
                        onClick={(e) => onTogglePin(note.id, e)}
                        className={`p-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors ${
                          note.isPinned ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'
                        }`}
                        title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
                      >
                        <Pin className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}
                  </div>

                  {/* Note Title */}
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate pr-2">
                    {note.title || 'Untitled Note'}
                  </h3>

                  {/* Snippet Preview */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {getPreviewText(note.content)}
                  </p>

                  {/* Tags (Unboxed clean quiet text) */}
                  {note.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      <Tag className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {note.tags.map((t) => `#${t}`).join(' · ')}
                      </span>
                    </div>
                  )}

                  {/* Quick Hover Actions Menu */}
                  <div className="absolute right-2 bottom-2 hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shadow-md">
                    {activeFilter.type === 'trash' ? (
                      <>
                        <button
                          onClick={(e) => onRestoreNote(note.id, e)}
                          className="p-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded"
                          title="Restore Note"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => onPermanentDeleteNote(note.id, e)}
                          className="p-1 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => onDuplicateNote(note.id, e)}
                          className="p-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                          title="Duplicate Note"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => onDeleteNote(note.id, e)}
                          className="p-1 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded"
                          title="Move to Trash"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
