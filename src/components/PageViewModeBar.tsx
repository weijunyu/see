export function PageViewModeBar({
  viewMode,
  setViewMode,
}: {
  viewMode: "plain" | "markdown";
  setViewMode: (mode: "plain" | "markdown") => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-100 border-t border-gray-300 flex justify-center py-2 z-10">
      <button
        className={`cursor-pointer px-4 py-2 mx-2 rounded-md ${
          viewMode === "plain"
            ? "bg-blue-600 text-white"
            : "bg-white text-blue-600 border border-blue-600"
        }`}
        onClick={() => setViewMode("plain")}
        disabled={viewMode === "plain"}
      >
        Plain Text
      </button>
      <button
        className={`cursor-pointer px-4 py-2 mx-2 rounded-md ${
          viewMode === "markdown"
            ? "bg-blue-600 text-white"
            : "bg-white text-blue-600 border border-blue-600"
        }`}
        onClick={() => setViewMode("markdown")}
        disabled={viewMode === "markdown"}
      >
        Markdown
      </button>
    </div>
  );
}
