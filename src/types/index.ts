export interface Page {
  id: number;
  name: string;
  content: string;
  encrypted: 0 | 1;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
