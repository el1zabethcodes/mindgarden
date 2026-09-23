import { Note, NoteCreate, NoteUpdate, Tag, MoodEntry, Stats, Habit, HabitCheckin, FeedPage } from "./types";

const BASE_URL = "http://localhost:8000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`api request failed: ${res.status} ${res.statusText}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  getNotes: async (filters?: { search?: string; status?: string; tag?: string }): Promise<Note[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.tag) params.append("tag", filters.tag);

    const query = params.toString() ? `?${params.toString()}` : "";
    return request<Note[]>(`/notes${query}`);
  },

  getFeed: async (opts?: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
    tag?: string;
    sort?: string;
  }): Promise<FeedPage> => {
    const params = new URLSearchParams();
    if (opts?.limit) params.append("limit", String(opts.limit));
    if (opts?.offset) params.append("offset", String(opts.offset));
    if (opts?.search) params.append("search", opts.search);
    if (opts?.status) params.append("status", opts.status);
    if (opts?.tag) params.append("tag", opts.tag);
    if (opts?.sort) params.append("sort", opts.sort);

    const query = params.toString() ? `?${params.toString()}` : "";
    return request<FeedPage>(`/feed${query}`);
  },

  getNote: async (id: string): Promise<Note> => {
    return request<Note>(`/notes/${id}`);
  },

  createNote: async (note: NoteCreate): Promise<Note> => {
    return request<Note>("/notes", {
      method: "POST",
      body: JSON.stringify(note),
    });
  },

  updateNote: async (id: string, note: NoteUpdate): Promise<Note> => {
    return request<Note>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(note),
    });
  },

  deleteNote: async (id: string): Promise<void> => {
    return request<void>(`/notes/${id}`, {
      method: "DELETE",
    });
  },

  getTags: async (): Promise<Tag[]> => {
    return request<Tag[]>("/tags");
  },

  getMoodEntries: async (days = 14): Promise<MoodEntry[]> => {
    return request<MoodEntry[]>(`/mood?days=${days}`);
  },

  getStats: async (days = 30): Promise<Stats> => {
    return request<Stats>(`/stats?days=${days}`);
  },

  getHabits: async (): Promise<Habit[]> => {
    return request<Habit[]>("/habits");
  },

  createHabit: async (data: { name: string; description?: string; icon?: string }): Promise<Habit> => {
    return request<Habit>("/habits", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  checkInHabit: async (habitId: string): Promise<HabitCheckin> => {
    return request<HabitCheckin>(`/habits/${habitId}/check-in`, { method: "POST" });
  },
};
