export interface Env {
  DB: D1Database;
}

export interface CreatePageRequest {
  content: string;
  encrypted?: boolean;
  expires_in_hours?: number;
  view_once_only?: boolean;
}

export interface Page {
  id: number;
  name: string;
  content: string;
  encrypted: 0 | 1;
  view_once_only: 0 | 1 | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PageSuggestion {
  value: string;
}

export interface ErrorResponse {
  error: string;
}

export interface CounterResult {
  counter_value: number;
}
