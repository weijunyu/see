import { useEffect, useState } from "react";
import type { Page } from "../../types";
import { Link } from "@tanstack/react-router";
import { PageList } from "../PageList";

export function Index() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  return (
    <>
      <section>
        <p>Try visiting a page by going to /{`{page-name}`} in the URL.</p>
        <p>
          For example:{" "}
          <Link
            to="/$name"
            params={{ name: "Welcome Page" }}
            className="text-blue-600 hover:underline"
          >
            /Welcome Page
          </Link>
        </p>
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
