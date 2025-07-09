import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Page } from "../types";
import { PageList } from "../components/PageList";

function Index() {
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
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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

  return (
    <div className="p-8">
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
    </div>
  );
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
});
