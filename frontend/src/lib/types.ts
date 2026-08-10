export type NoteStatus = "seed" | "growing" | "evergreen";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  status: NoteStatus;
  mood_color: string;
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
  is_favorite?: boolean;
  tags?: string[];
  linked_note_ids?: string[];
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  status?: NoteStatus;
  mood_color?: string;
  is_favorite?: boolean;
  tags?: string[];
  linked_note_ids?: string[];
}
