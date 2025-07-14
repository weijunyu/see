import { useState } from "react";
import type { Page } from "../types";
import { encryptContent } from "../lib/crypto";

interface Props {
  name: string;
  onPageCreated: (page: Page) => void;
  onPageCreateError: (message: string) => void;
}

export function PageCreate({ name, onPageCreated, onPageCreateError }: Props) {
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    if (usePassword && !password.trim()) return;

    void (async () => {
      setCreating(true);
      try {
        let contentToSend = newContent;

        // Encrypt content if password is provided
        if (usePassword && password.trim()) {
          contentToSend = await encryptContent(newContent, password);
        }

        const response = await fetch(`/api/pages/${encodeURIComponent(name)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: contentToSend,
            encrypted: usePassword && password.trim() !== "",
          }),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(errorData.error || "Failed to create page");
        }

        const createdPage = (await response.json()) as Page;
        onPageCreated(createdPage);
        setNewContent("");
        setPassword("");
        setUsePassword(false);
      } catch (err) {
        onPageCreateError(
          err instanceof Error ? err.message : "Failed to create page"
        );
      } finally {
        setCreating(false);
      }
    })();
  };

  return (
    <form onSubmit={handleCreatePage} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-2">
          Add your content below. It will be available at /{name}
        </label>
        <textarea
          id="content"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="w-full h-48 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="usePassword"
          checked={usePassword}
          onChange={(e) => setUsePassword(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="usePassword" className="text-sm font-medium">
          Password protect this page
        </label>
      </div>

      {usePassword && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Enter password for encryption:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={usePassword}
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={
            creating || !newContent.trim() || (usePassword && !password.trim())
          }
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
  );
}
