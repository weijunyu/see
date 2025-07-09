import { Link } from "@tanstack/react-router";
import type { Page } from "../types";

interface Props {
  pages: Page[];
}

export function PageList({ pages }: Props) {
  return (
    <div className="space-y-4">
      {pages.map((page) => (
        <div key={page.id} className="border rounded-lg p-4 hover:bg-gray-50">
          <Link
            to="/$name"
            params={{ name: page.name }}
            className="text-lg font-medium text-blue-600 hover:underline"
          >
            {page.name}
          </Link>
          <p className="text-gray-600 text-sm mt-1">
            Updated: {new Date(page.updated_at).toLocaleString()}
          </p>
          <p className="text-gray-800 mt-2 line-clamp-3">
            {page.content.substring(0, 1000)}
          </p>
        </div>
      ))}
    </div>
  );
}
