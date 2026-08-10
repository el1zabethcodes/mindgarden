import { Note, NoteCreate, NoteUpdate, Tag } from "./types";

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
};
