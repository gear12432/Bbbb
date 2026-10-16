import React, { useState, useEffect, useRef } from 'react';
import { Note, Folder, ViewMode, AIActionType } from '../types/note';
import { MarkdownViewer } from './MarkdownViewer';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Table as TableIcon,
  Minus,
  Sparkles,
  Save,
  Check,
  Folder as FolderIcon,
  Tag,
  X,
  Plus,
  Eye,
  Edit3,
  Columns,
  Download,
  History,
  Copy,
  Trash2,
  MoreVertical,
  Highlighter,
  Link as LinkIcon,
  Printer,
  ChevronDown
} from 'lucide-react';

interface NoteEditorProps {
  note: Note | null;
  folders: Folder[];
  onUpdateNote: (updatedNote: Note) => void;
  onDuplicateNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onOpenAIModal: (action: AIActionType) => void;
  onOpenHistoryModal: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  folders,
  onUpdateNote,
  onDuplicateNote,
  onDeleteNote,
  onOpenAIModal,
  onOpenHistoryModal,
  onShowToast,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [folderId, setFolderId] = useState('unfiled');
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [newTagInput, setNewTagInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal state when note selection changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || []);
      setFolderId(note.folderId || 'unfiled');
      setSaveStatus('saved');
    }
  }, [note?.id]);

  // Handle Real-time Debounced Auto-Save
  const triggerAutoSave = (
    newTitle: string,
    newContent: string,
    newTags: string[],
    newFolderId: string
  ) => {
    if (!note) return;
    setSaveStatus('unsaved');

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saving');

      // Create snapshot if significant changes occur
      const now = Date.now();
      const updatedNote: Note = {
        ...note,
        title: newTitle,
        content: newContent,
        tags: newTags,
        folderId: newFolderId,
        updatedAt: now,
      };

      onUpdateNote(updatedNote);
      setTimeout(() => setSaveStatus('saved'), 300);
    }, 500);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    triggerAutoSave(val, content, tags, folderId);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    triggerAutoSave(title, val, tags, folderId);
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFolderId(val);
    triggerAutoSave(title, content, tags, val);
    onShowToast(`Moved note to folder`, 'info');
  };

  // Tag Management
  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!clean) return;
    if (tags.includes(clean)) {
      setNewTagInput('');
      return;
    }
    const updatedTags = [...tags, clean];
    setTags(updatedTags);
    setNewTagInput('');
    triggerAutoSave(title, content, updatedTags, folderId);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove);
    setTags(updatedTags);
    triggerAutoSave(title, content, updatedTags, folderId);
  };

  // Rich Text Formatting Insertions
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    triggerAutoSave(title, newContent, tags, folderId);

    // Re-focus and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  // Insert Line-based prefix (e.g. H1, Lists, Quotes)
  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = content.indexOf('\n', start);
    const end = lineEnd === -1 ? content.length : lineEnd;

    const currentLine = content.substring(lineStart, end);
    const newContent =
      content.substring(0, lineStart) + `${prefix}${currentLine}` + content.substring(end);

    setContent(newContent);
    triggerAutoSave(title, newContent, tags, folderId);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart + prefix.length + currentLine.length, lineStart + prefix.length + currentLine.length);
    }, 10);
  };

  // Toggle checklist item in preview
  const handleToggleChecklistInPreview = (lineIndex: number) => {
    const lines = content.split('\n');
    if (lineIndex < 0 || lineIndex >= lines.length) return;

    const line = lines[lineIndex];
    if (line.includes('- [ ] ')) {
      lines[lineIndex] = line.replace('- [ ] ', '- [x] ');
    } else if (line.includes('- [x] ') || line.includes('- [X] ')) {
      lines[lineIndex] = line.replace(/- \[[xX]\] /, '- [ ] ');
    }

    const updatedContent = lines.join('\n');
    setContent(updatedContent);
    triggerAutoSave(title, updatedContent, tags, folderId);
  };

  // Export File Options
  const handleExport = (format: 'md' | 'txt' | 'html' | 'pdf') => {
    setShowExportMenu(false);
    if (!note) return;

    const safeFilename = (title || 'untitled_note').toLowerCase().replace(/[^a-z0-9_-]/g, '_');

    if (format === 'pdf') {
      window.print();
      return;
    }

    let fileContent = '';
    let mimeType = 'text/plain';
    let ext = 'txt';

    if (format === 'md') {
      fileContent = `# ${title}\n\n${content}`;
      mimeType = 'text/markdown';
      ext = 'md';
    } else if (format === 'txt') {
      fileContent = `${title}\n${'='.repeat(title.length)}\n\n${content}`;
      mimeType = 'text/plain';
      ext = 'txt';
    } else if (format === 'html') {
      fileContent = `<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:sans-serif;padding:2rem;max-width:800px;margin:0 auto;line-height:1.6;}</style></head><body><h1>${title}</h1><div>${content.replace(/\n/g, '<br/>')}</div></body></html>`;
      mimeType = 'text/html';
      ext = 'html';
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFilename}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`Exported as .${ext.toUpperCase()}`, 'success');
  };

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
          <Edit3 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Note Selected</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          Select a note from the list on the left or create a brand new note to begin writing.
        </p>
      </div>
    );
  }

  // Word, char, reading time stats
  const textTrim = content.trim();
  const wordCount = textTrim ? textTrim.split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const paragraphCount = textTrim ? textTrim.split(/\n\s*\n/).filter(Boolean).length : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden relative" id="print-area">
      {/* Note Header Bar */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
        {/* Left: Folder Dropdown + Auto-Save Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg px-2.5 py-1 text-xs">
            <FolderIcon className="w-3.5 h-3.5 text-blue-500" />
            <select
              value={folderId}
              onChange={handleFolderChange}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-medium border-none focus:outline-none cursor-pointer pr-1"
            >
              <option value="unfiled">Unfiled Notes</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Real-time Save Indicator */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {saveStatus === 'saved' && (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Saved</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <Save className="w-3 h-3 text-amber-500 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'unsaved' && <span>Edited</span>}
          </div>
        </div>

        {/* Right: View Mode Segmented Control + AI + Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Controls */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'edit'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Edit Mode"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Split View"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Preview Mode"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          {/* ✨ AI Assistant Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAiMenu(!showAiMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-lg transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>AI Assistant</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showAiMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 text-xs font-medium text-slate-700 dark:text-slate-200">
                <button
                  onClick={() => {
                    setShowAiMenu(false);
                    onOpenAIModal('summarize');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Summarize Note</span>
                </button>
                <button
                  onClick={() => {
                    setShowAiMenu(false);
                    onOpenAIModal('improve');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Improve Writing</span>
                </button>
                <button
                  onClick={() => {
                    setShowAiMenu(false);
                    onOpenAIModal('fix_grammar');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Fix Spelling & Grammar</span>
                </button>
                <button
                  onClick={() => {
                    setShowAiMenu(false);
                    onOpenAIModal('continue');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Continue Writing</span>
                </button>
                <button
                  onClick={() => {
                    setShowAiMenu(false);
                    onOpenAIModal('outline');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <List className="w-3.5 h-3.5 text-purple-500" />
                  <span>Generate Outline</span>
                </button>
                <button
                  onClick={() => {
                    setShowAiMenu(false);
                    onOpenAIModal('auto_tag');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <Tag className="w-3.5 h-3.5 text-rose-500" />
                  <span>Auto-generate Tags</span>
                </button>
              </div>
            )}
          </div>

          {/* Export Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Export & Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 text-xs font-medium text-slate-700 dark:text-slate-200 space-y-0.5">
                <button
                  onClick={() => handleExport('md')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export as Markdown (.MD)</span>
                </button>
                <button
                  onClick={() => handleExport('txt')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export as Text (.TXT)</span>
                </button>
                <button
                  onClick={() => handleExport('html')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export as HTML</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print / Export PDF</span>
                </button>
                <hr className="my-1 border-slate-200 dark:border-slate-700" />
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    onOpenHistoryModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Note History</span>
                </button>
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    onDuplicateNote(note.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Duplicate Note</span>
                </button>
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    onDeleteNote(note.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Move to Trash</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note Title Input */}
      <div className="px-6 pt-4 pb-2 shrink-0">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note Title..."
          className="w-full text-2xl sm:text-3xl font-bold bg-transparent text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-slate-200 dark:focus:border-slate-800 pb-1 transition-colors"
        />

        {/* Tags Chips & Add Tag Input */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs no-print">
          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md"
            >
              <span>#{t}</span>
              <button
                onClick={() => handleRemoveTag(t)}
                className="hover:text-rose-500 text-slate-400"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <div className="flex items-center">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  handleAddTag(newTagInput);
                }
              }}
              placeholder="+ Add tag..."
              className="w-24 px-2 py-0.5 text-xs bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Formatting Toolbar (Only visible in edit or split mode) */}
      {viewMode !== 'preview' && (
        <div className="px-6 py-2 border-y border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center gap-1 overflow-x-auto no-print shrink-0">
          <button
            onClick={() => insertLinePrefix('# ')}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertLinePrefix('## ')}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertLinePrefix('### ')}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

          <button
            onClick={() => insertFormatting('**', '**', 'bold text')}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('*', '*', 'italic text')}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 italic"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            onClick={() => insertFormatting('==', '==', 'highlighted text')}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-amber-500"
            title="Highlight Text"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

          <button
            onClick={() => insertLinePrefix('- ')}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertLinePrefix('1. ')}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertLinePrefix('- [ ] ')}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Checklist"
          >
            <CheckSquare className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

          <button
            onClick={() => insertFormatting('`', '`', 'code')}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('\n```javascript\n', '\n```\n', '// code here')}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs"
            title="Code Block"
          >
            {'{ }'}
          </button>
          <button
            onClick={() => insertLinePrefix('> ')}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('[', '](https://example.com)', 'link text')}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('\n| Feature | Support |\n| :--- | :---: |\n| Auto-save | ✅ Yes |\n\n')}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('\n---\n')}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Horizontal Divider"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Workspace Area (Edit / Split / Preview) */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Editor Area */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={(e) => {
                // Handle Tab Key for Indentation
                if (e.key === 'Tab') {
                  e.preventDefault();
                  insertFormatting('  ', '');
                }
              }}
              placeholder="Write your note here using Markdown..."
              className="w-full h-full resize-none bg-transparent text-slate-800 dark:text-slate-100 text-sm font-sans leading-relaxed focus:outline-none placeholder-slate-300 dark:placeholder-slate-600"
            />
          </div>
        )}

        {/* Vertical Divider in Split View */}
        {viewMode === 'split' && (
          <div className="w-px bg-slate-200 dark:border-slate-800 shrink-0" />
        )}

        {/* Markdown Preview Area */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 h-full overflow-y-auto pr-2">
            <MarkdownViewer
              content={content}
              onToggleChecklist={handleToggleChecklistInPreview}
            />
          </div>
        )}
      </div>

      {/* Footer Bar / Statistics */}
      <div className="px-6 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-4 shrink-0 no-print font-mono">
        <div className="flex items-center gap-4">
          <span>{wordCount.toLocaleString()} words</span>
          <span>·</span>
          <span>{charCount.toLocaleString()} chars</span>
          <span>·</span>
          <span>{paragraphCount} paragraphs</span>
          <span>·</span>
          <span>~{readingTime} min read</span>
        </div>

        <div>
          <span>Last modified: {new Date(note.updatedAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};
