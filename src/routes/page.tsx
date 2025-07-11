import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { useEffect, useState } from "react";
import { PageCreate } from "../components/PageCreate";
import { PageView } from "../components/PageView";

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

  function onPageCreated(page: Page) {
    setPage(page);
    setShowCreateForm(false);
  }

  function onPageCreateError(message: string) {
    setError(message);
    setShowCreateForm(false);
  }

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  if (showCreateForm) {
    return (
      <PageCreate
        name={name}
        onPageCreated={onPageCreated}
        onPageCreateError={onPageCreateError}
      />
    );
  }

  if (page) {
    return <PageView page={page} />;
  }

  return <div className="text-center">Page not found</div>;
}

export const pageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$name",
  component: PageComponent,
});
