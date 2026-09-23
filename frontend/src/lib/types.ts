export type NoteStatus = "seed" | "growing" | "evergreen";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface FeedPage {
  items: Note[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  score: number; // 1..10
  note: string;
  entry_date: string; // YYYY-MM-DD
  created_at: string;
}

export interface MoodPoint {
  date: string;
  avg_score: number | null;
}

export interface TagStat {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface ActivityDay {
  date: string;
  notes: number;
  moods: number;
  checkins: number;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string; // botanical key: seedling, leaf, sun...
  is_archived: boolean;
  created_at: string;
  current_streak: number;
  total_checkins: number;
  recent_days: boolean[]; // last 30 days, oldest first
}

export interface HabitCheckin {
  habit_id: string;
  log_date: string;
  current_streak: number;
}

export interface Stats {
  days: number;
  mood: MoodPoint[];
  top_tags: TagStat[];
  activity: ActivityDay[];
  totals: {
    notes: number;
    habits: number;
    longest_streak: number;
    avg_mood: number | null;
  };
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
