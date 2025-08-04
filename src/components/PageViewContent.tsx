import { marked } from "marked";

export function PageViewContent({
  viewMode,
  content,
}: {
  viewMode: "plain" | "markdown";
  content: string | null;
}) {
  return (
    <div className="max-w-none min-h-[200px]">
      {viewMode === "plain" ? (
        <p className="whitespace-pre-wrap">{content}</p>
      ) : (
        <div
          className="prose prose-slate lg:prose-lg dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: marked.parse(content || "") }}
        />
      )}
    </div>
  );
}
