import { formatForDisplay } from "../lib/dates";
import type { Page } from "../types";

interface Props {
  page: Page;
}

export function PageView({ page }: Props) {
  return (
    <>
      <div className="mb-4">
        <p className="text-gray-600 text-sm">
          Created: {formatForDisplay(page.created_at)}
        </p>
        <p className="text-gray-600 text-sm">
          Updated: {formatForDisplay(page.updated_at)}
        </p>
      </div>

      <div className="max-w-none">
        <p className="whitespace-pre-wrap">{page.content}</p>
      </div>
    </>
  );
}
