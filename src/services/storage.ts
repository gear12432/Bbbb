import { Note, Folder } from '../types/note';

const NOTES_KEY = 'noteforge_notes_v1';
const FOLDERS_KEY = 'noteforge_folders_v1';

export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'work', name: 'Work & Projects', color: '#3b82f6', iconName: 'Briefcase', createdAt: Date.now() - 8000000 },
  { id: 'personal', name: 'Personal & Ideas', color: '#10b981', iconName: 'User', createdAt: Date.now() - 7000000 },
  { id: 'study', name: 'Learning & Notes', color: '#8b5cf6', iconName: 'BookOpen', createdAt: Date.now() - 6000000 },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'welcome-note-1',
    title: '🚀 Welcome to NoteForge!',
    content: `# Welcome to NoteForge 📝

NoteForge is your modern, distraction-free markdown notepad with **instant real-time auto-save**, smart folders, tag organization, and built-in AI writing assistance.

---

### ✨ Key Features You'll Love:

- **Rich Markdown Editor**: Write with headings, **bold**, *italics*, ~~strikethrough~~, \`inline code\`, lists, and interactive checklists.
- **Organization**: Assign notes to custom folders like **Work**, **Personal**, or **Learning**, and add custom tags.
- **Pinning & Sorting**: Pin your most important notes to the top and sort by modification date, creation date, or title.
- **Trash & Recovery**: Deleted notes stay safely in your Trash Bin so you can restore them anytime.
- **AI Writing Assistant**: Click the **✨ AI Assistant** button to summarize, polish grammar, generate outlines, or rephrase your thoughts seamlessly.
- **Import / Export**: Backup all your data as JSON or export individual notes to Markdown, TXT, HTML, or PDF!

---

### 📋 Try an Interactive Checklist:
- [x] Create your first note
- [ ] Try creating a new custom folder
- [ ] Experiment with Markdown formatting
- [ ] Use \`Cmd/Ctrl + S\` or auto-save

Happy note taking!`,
    folderId: 'personal',
    tags: ['welcome', 'getting-started', 'guide'],
    isPinned: true,
    isTrash: false,
    color: '#3b82f6',
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
    history: [
      {
        id: 'hist-1',
        timestamp: Date.now() - 3600000 * 2,
        title: '🚀 Welcome to NoteForge!',
        content: '# Welcome to NoteForge 📝\n\nInitial draft of welcome guide.'
      }
    ]
  },
  {
    id: 'sample-markdown-guide',
    title: '⚡ Quick Markdown Cheat Sheet',
    content: `# Markdown Syntax Quick Reference

Markdown allows you to write structured formatted content quickly using plain text.

## 1. Headings
# Heading 1
## Heading 2
### Heading 3

## 2. Text Formatting
*Italic text* or _italic text_
**Bold text** or __bold text__
***Bold and italic***
~~Strikethrough text~~
==Highlighted text==

## 3. Lists
### Unordered List:
- Key item 1
- Key item 2
  - Sub-item A
  - Sub-item B

### Ordered List:
1. First step
2. Second step
3. Third step

### Checklists:
- [x] Completed task
- [ ] Pending task

## 4. Code Blocks
\`\`\`javascript
// JavaScript Example
function calculateWordCount(text) {
  return text.trim().split(/\\s+/).filter(Boolean).length;
}

console.log('Word count:', calculateWordCount('Hello NoteForge!'));
\`\`\`

## 5. Blockquotes & Tables
> "Simplicity is prerequisite for reliability." – Edsger W. Dijkstra

| Feature | Support | Shortcut |
| :--- | :---: | ---: |
| Auto-save | ✅ Yes | Realtime |
| Search | ✅ Yes | Ctrl + F |
| Pin Note | ✅ Yes | Ctrl + P |

---

Enjoy writing with Markdown!`,
    folderId: 'study',
    tags: ['markdown', 'cheat-sheet', 'tips'],
    isPinned: false,
    isTrash: false,
    color: '#8b5cf6',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 1,
  },
  {
    id: 'sample-project-roadmap',
    title: '🎯 Q4 Product & Architecture Roadmap',
    content: `# Q4 Engineering Goals

## High Priority Milestones

1. **Local Storage Persistence & Sync**
   - Ensure local storage quota checks
   - Implement debounced auto-save (500ms debounce)
   - Support JSON backup & restore export

2. **UI & Keyboard Ergonomics**
   - Implement hotkeys for New Note (\`Ctrl+N\`), Save (\`Ctrl+S\`), Search (\`Ctrl+F\`)
   - Add Zen Mode for distraction-free writing
   - High contrast Dark Mode optical tuning

3. **Gemini AI Integration**
   - Smart summarization endpoint
   - Automated tagging suggestions
   - Multi-language translation support

---

*Updated weekly during team sync.*`,
    folderId: 'work',
    tags: ['work', 'roadmap', 'engineering'],
    isPinned: true,
    isTrash: false,
    color: '#10b981',
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 3,
  }
];

// LocalStorage helpers
export const loadNotesFromStorage = (): Note[] => {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) {
      saveNotesToStorage(INITIAL_NOTES);
      return INITIAL_NOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_NOTES;
  } catch (err) {
    console.error('Failed to load notes from storage:', err);
    return INITIAL_NOTES;
  }
};

export const saveNotesToStorage = (notes: Note[]): void => {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save notes to storage:', err);
  }
};

export const loadFoldersFromStorage = (): Folder[] => {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (!raw) {
      saveFoldersToStorage(DEFAULT_FOLDERS);
      return DEFAULT_FOLDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_FOLDERS;
  } catch (err) {
    console.error('Failed to load folders from storage:', err);
    return DEFAULT_FOLDERS;
  }
};

export const saveFoldersToStorage = (folders: Folder[]): void => {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch (err) {
    console.error('Failed to save folders to storage:', err);
  }
};

// Export/Import JSON
export interface BackupData {
  version: string;
  exportedAt: string;
  notes: Note[];
  folders: Folder[];
}

export const exportAllDataJSON = (notes: Note[], folders: Folder[]): string => {
  const data: BackupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    notes,
    folders,
  };
  return JSON.stringify(data, null, 2);
};

export const importAllDataJSON = (jsonString: string): { notes: Note[]; folders: Folder[] } => {
  const parsed = JSON.parse(jsonString);
  if (!parsed || !Array.isArray(parsed.notes)) {
    throw new Error('Invalid backup file format. Expected a JSON object with a "notes" array.');
  }
  const notes: Note[] = parsed.notes.map((n: any) => ({
    id: n.id || 'note-' + Math.random().toString(36).substring(2, 9),
    title: n.title || 'Untitled Note',
    content: n.content || '',
    folderId: n.folderId || 'unfiled',
    tags: Array.isArray(n.tags) ? n.tags : [],
    isPinned: Boolean(n.isPinned),
    isTrash: Boolean(n.isTrash),
    color: n.color,
    createdAt: typeof n.createdAt === 'number' ? n.createdAt : Date.now(),
    updatedAt: typeof n.updatedAt === 'number' ? n.updatedAt : Date.now(),
    history: Array.isArray(n.history) ? n.history : [],
  }));

  const folders: Folder[] = Array.isArray(parsed.folders)
    ? parsed.folders.map((f: any) => ({
        id: f.id || 'folder-' + Math.random().toString(36).substring(2, 9),
        name: f.name || 'Folder',
        color: f.color || '#3b82f6',
        iconName: f.iconName,
        createdAt: typeof f.createdAt === 'number' ? f.createdAt : Date.now(),
      }))
    : DEFAULT_FOLDERS;

  return { notes, folders };
};
