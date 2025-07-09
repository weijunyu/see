import { useState } from "react";
import type { Page } from "../types";

interface Props {
  name: string;
  onPageCreated: (page: Page) => void;
  onPageCreateError: (message: string) => void;
}

export function PageCreate({ name, onPageCreated, onPageCreateError }: Props) {
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setCreating(true);
    try {
      const response = await fetch(`/api/pages/${encodeURIComponent(name)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to create page");
      }

      const createdPage = await response.json();
      onPageCreated(createdPage);
      setNewContent("");
    } catch (err) {
      onPageCreateError(
        err instanceof Error ? err.message : "Failed to create page"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8">
      <form onSubmit={handleCreatePage} className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Content:
          </label>
          <textarea
            id="content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full h-48 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={creating || !newContent.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
