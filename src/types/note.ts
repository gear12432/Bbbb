export interface NoteHistorySnapshot {
  id: string;
  timestamp: number;
  title: string;
  content: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string; // 'all' | 'unfiled' | folder custom id
  tags: string[];
  isPinned: boolean;
  isTrash: boolean;
  color?: string; // Hex or tailwind color
  createdAt: number;
  updatedAt: number;
  trashedAt?: number;
  history?: NoteHistorySnapshot[];
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  iconName?: string;
  createdAt: number;
}

export type SortOption = 'updatedAt' | 'createdAt' | 'titleAsc' | 'titleDesc';

export type ViewMode = 'edit' | 'split' | 'preview';

export type ActiveFilter =
  | { type: 'all' }
  | { type: 'pinned' }
  | { type: 'trash' }
  | { type: 'folder'; folderId: string }
  | { type: 'tag'; tag: string };

export type AIActionType =
  | 'summarize'
  | 'improve'
  | 'fix_grammar'
  | 'continue'
  | 'outline'
  | 'auto_tag'
  | 'translate'
  | 'change_tone';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}
