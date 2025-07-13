import { Link } from "@tanstack/react-router";
import type { Page } from "../types";
import { formatForDisplay } from "../lib/dates";

interface Props {
  pages: Page[];
}

export function PageList({ pages }: Props) {
  return (
    <div className="space-y-4">
      {pages.map((page) => (
        <div key={page.id} className="border rounded-lg p-4 hover:bg-gray-50">
          <span className="flex items-center gap-x-2">
            <Link
              to="/$name"
              params={{ name: page.name }}
              className="text-lg font-medium text-blue-600 hover:underline"
            >
              {page.name}
            </Link>
            {page.encrypted && <span className="text-sm ">🔒</span>}
          </span>

          <p className="text-gray-600 text-sm mt-1">
            Updated: {formatForDisplay(page.updated_at)}
          </p>

          {!page.encrypted && (
            <p className="text-gray-800 mt-2 line-clamp-3">
              {page.content.substring(0, 1000)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
