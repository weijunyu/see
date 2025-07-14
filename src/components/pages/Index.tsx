import { useEffect, useState } from "react";
import type { Page } from "../../types";
import { Link } from "@tanstack/react-router";
import { PageList } from "../PageList";

export function Index() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [suggestedPageName, setSuggestedPageName] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetch("/api/recents/?count=10")
      .then((res) => res.json())
      .then((data: Page[]) => {
        setPages(data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load pages");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("/api/pages/next-name")
      .then((res) => res.json())
      .then((data: { value: string }) => {
        setSuggestedPageName(data.value);
      })
      .catch(() => {
        // swallow
      })
      .finally(() => {
        // swallow
      });
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  return (
    <>
      <section>
        <p></p>
        {suggestedPageName && (
          <p className="flex gap-1 mt-2">
            Add content to a new page:
            <Link
              to="/$name"
              params={{ name: suggestedPageName }}
              className="inline-block px-2  bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              /{suggestedPageName}
            </Link>
          </p>
        )}
      </section>

      {pages.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recently Updated Pages</h2>
          <PageList pages={pages} />
        </section>
      ) : null}
    </>
  );
}
