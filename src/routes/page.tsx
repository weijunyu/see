import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { useEffect, useState } from "react";

interface Page {
  id: number;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

function PageComponent() {
  const { name } = pageRoute.useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (name) {
      // Fetch page by name
      fetch(`/api/pages/${encodeURIComponent(name)}`)
        .then((res) => {
          if (!res.ok && res.status === 404) {
            // Page not found - show create form
            setShowCreateForm(true);
            setLoading(false);
            return;
          }
          return res.json();
        })
        .then((data: Page) => {
          if (data) {
            setPage(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [name]);

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
      setPage(createdPage);
      setShowCreateForm(false);
      setNewContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create page");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Create New Page</h1>
        <p className="text-gray-600 mb-4">
          Page "{name}" doesn't exist. Would you like to create it?
        </p>

        <form onSubmit={handleCreatePage} className="space-y-4">
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Page Content:
            </label>
            <textarea
              id="content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Enter your content here..."
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
              {creating ? "Creating..." : "Create Page"}
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

  if (page) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">{page.name}</h1>
        <div className="mb-4">
          <p className="text-gray-600 text-sm">
            Created: {new Date(page.created_at).toLocaleString()}
          </p>
          <p className="text-gray-600 text-sm">
            Updated: {new Date(page.updated_at).toLocaleString()}
          </p>
        </div>
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{page.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="text-center">Page not found</div>
    </div>
  );
}

export const pageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$name",
  component: PageComponent,
});
