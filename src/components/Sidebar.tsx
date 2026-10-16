import React from 'react';
import { Note, Folder, ActiveFilter } from '../types/note';
import {
  FileText,
  Pin,
  Trash2,
  Folder as FolderIcon,
  FolderPlus,
  Tag,
  Briefcase,
  User,
  BookOpen,
  Code,
  Sparkles,
  MoreVertical,
  Check
} from 'lucide-react';

interface SidebarProps {
  notes: Note[];
  folders: Folder[];
  activeFilter: ActiveFilter;
  onSelectFilter: (filter: ActiveFilter) => void;
  onOpenFolderModal: (folder?: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  onEmptyTrash: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  folders,
  activeFilter,
  onSelectFilter,
  onOpenFolderModal,
  onDeleteFolder,
  onEmptyTrash,
  isOpen,
  onCloseMobile,
}) => {
  // Calculated stats
  const activeNotes = notes.filter((n) => !n.isTrash);
  const trashNotes = notes.filter((n) => n.isTrash);
  const pinnedNotes = activeNotes.filter((n) => n.isPinned);

  // Extract unique tags and counts
  const tagCounts: Record<string, number> = {};
  activeNotes.forEach((n) => {
    n.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  // Folder note counts
  const getFolderCount = (folderId: string) => {
    return activeNotes.filter((n) => n.folderId === folderId).length;
  };

  const totalWords = activeNotes.reduce((acc, note) => {
    const text = note.content || '';
    return acc + (text.trim().split(/\s+/).filter(Boolean).length || 0);
  }, 0);

  // Helpers to pick lucide folder icon
  const renderFolderIcon = (iconName?: string, color?: string) => {
    const props = { className: 'w-4 h-4 shrink-0', style: { color: color || '#3b82f6' } };
    switch (iconName) {
      case 'Briefcase':
        return <Briefcase {...props} />;
      case 'User':
        return <User {...props} />;
      case 'BookOpen':
        return <BookOpen {...props} />;
      case 'Code':
        return <Code {...props} />;
      case 'Sparkles':
        return <Sparkles {...props} />;
      default:
        return <FolderIcon {...props} />;
    }
  };

  const isFilterActive = (filter: ActiveFilter) => {
    if (filter.type === 'all' && activeFilter.type === 'all') return true;
    if (filter.type === 'pinned' && activeFilter.type === 'pinned') return true;
    if (filter.type === 'trash' && activeFilter.type === 'trash') return true;
    if (filter.type === 'folder' && activeFilter.type === 'folder' && filter.folderId === activeFilter.folderId)
      return true;
    if (filter.type === 'tag' && activeFilter.type === 'tag' && filter.tag === activeFilter.tag) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-50/90 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Section 1: Core Navigation */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onSelectFilter({ type: 'all' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                isFilterActive({ type: 'all' })
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>All Notes</span>
              </div>
              <span className="text-[11px] font-mono opacity-80">{activeNotes.length}</span>
            </button>

            <button
              onClick={() => {
                onSelectFilter({ type: 'pinned' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                isFilterActive({ type: 'pinned' })
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Pin className="w-4 h-4 text-amber-500" />
                <span>Pinned</span>
              </div>
              <span className="text-[11px] font-mono opacity-80">{pinnedNotes.length}</span>
            </button>

            <button
              onClick={() => {
                onSelectFilter({ type: 'trash' });
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                isFilterActive({ type: 'trash' })
                  ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Trash Bin</span>
              </div>
              <span className="text-[11px] font-mono opacity-80">{trashNotes.length}</span>
            </button>
          </div>

          {/* Section 2: Folders List */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span>Folders</span>
              <button
                onClick={() => onOpenFolderModal()}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
                title="Create New Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5">
              {folders.map((folder) => {
                const count = getFolderCount(folder.id);
                const active = isFilterActive({ type: 'folder', folderId: folder.id });
                return (
                  <div key={folder.id} className="group relative flex items-center">
                    <button
                      onClick={() => {
                        onSelectFilter({ type: 'folder', folderId: folder.id });
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        active
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        {renderFolderIcon(folder.iconName, folder.color)}
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <span className="text-[11px] font-mono opacity-80 shrink-0">{count}</span>
                    </button>

                    {/* Folder Options Menu on Hover */}
                    <div className="hidden group-hover:flex items-center gap-0.5 absolute right-8 top-1/2 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 rounded p-0.5 shadow-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenFolderModal(folder);
                        }}
                        className="p-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Edit Folder"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Tags List */}
          {sortedTags.length > 0 && (
            <div className="space-y-1.5">
              <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Tags
              </div>
              <div className="flex flex-wrap gap-1 px-2">
                {sortedTags.map(([tag, count]) => {
                  const active = isFilterActive({ type: 'tag', tag });
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        onSelectFilter({ type: 'tag', tag });
                        onCloseMobile();
                      }}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                        active
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Tag className="w-3 h-3 opacity-70" />
                      <span>{tag}</span>
                      <span className="opacity-60 text-[10px]">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty Trash Button if active filter is trash */}
          {activeFilter.type === 'trash' && trashNotes.length > 0 && (
            <div className="p-2">
              <button
                onClick={onEmptyTrash}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash ({trashNotes.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer / Storage Stats */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex justify-between items-center">
            <span>Notes stored:</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              {activeNotes.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Total words:</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              {totalWords.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(10, activeNotes.length * 5))}%` }}
            />
          </div>
        </div>
      </aside>
    </>
  );
};
