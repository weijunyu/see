import { pageRoute } from "../../routes.tsx";
import { useEffect, useRef, useState } from "react";
import type { Page as PageType } from "../../types/index.ts";
import { PageCreate } from "../PageCreate.tsx";
import { PageView } from "../PageView.tsx";

export function Page() {
  const { name } = pageRoute.useParams();
  const [page, setPage] = useState<PageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const hasFetchedPage = useRef(false);
  useEffect(() => {
    if (hasFetchedPage.current) return;
    hasFetchedPage.current = true;

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
        .then((data: PageType) => {
          if (data) {
            setPage(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load page");
          setLoading(false);
        });
    }
  }, [name]);

  function onPageCreated(page: PageType) {
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
