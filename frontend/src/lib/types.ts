export type NoteStatus = "seed" | "growing" | "evergreen";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  score: number; // 1..10
  note: string;
  entry_date: string; // YYYY-MM-DD
  created_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  status: NoteStatus;
  mood_color: string;
  mood_score: number | null; // 1 (wilting) to 10 (blooming), null = not logged
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  tags: Tag[];
  linked_note_ids: string[];
}

export interface NoteCreate {
  title: string;
  content?: string;
  status?: NoteStatus;
  mood_color?: string;
  mood_score?: number | null;
  is_favorite?: boolean;
  tags?: string[];
  linked_note_ids?: string[];
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  status?: NoteStatus;
  mood_color?: string;
  mood_score?: number | null;
  is_favorite?: boolean;
  tags?: string[];
  linked_note_ids?: string[];
}
