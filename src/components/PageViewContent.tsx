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
        <p className="whitespace-pre-wrap font-mono">{content}</p>
      ) : (
        <div
          className="prose prose-slate lg:prose-lg dark:prose-invert"
          dangerouslySetInnerHTML={{
            __html: marked.parse(
              (() => {
                // When storing we sanitize MD so things like ">" are encoded as &gt;
                // Decode HTML entities (like &lt; → < and &amp; → &) before parsing markdown
                const div = document.createElement("div");
                div.innerHTML = content || "";
                return div.textContent || div.innerText || "";
              })()
            ),
          }}
        />
      )}
    </div>
  );
}
