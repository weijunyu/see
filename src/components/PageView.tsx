import { useState } from "react";
import { formatForDisplay } from "../lib/dates";
import type { Page } from "../types";
import { decryptContent } from "../lib/crypto";
import { PageViewContent } from "./PageViewContent";
import { PageViewDecryptForm } from "./PageViewDecryptForm";
import { PageViewModeBar } from "./PageViewModeBar";

interface Props {
  page: Page;
}

export function PageView({ page }: Props) {
  const [password, setPassword] = useState("");
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);

  // Markdown tab state
  const isMd = page.name.endsWith(".md");
  const [viewMode, setViewMode] = useState<"plain" | "markdown">(
    isMd ? "markdown" : "plain"
  );

  const isEncrypted = page.encrypted;

  const handleDecrypt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    void (async () => {
      setDecrypting(true);
      setDecryptError(null);

      try {
        const content = await decryptContent(page.content, password);
        setDecryptedContent(content);
      } catch {
        setDecryptError("Failed to decrypt. Please check your password.");
      } finally {
        setDecrypting(false);
      }
    })();
  };

  // Get the content to display (decrypted or plain)
  const displayContent = isEncrypted ? decryptedContent : page.content;

  return (
    <>
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-200 text-sm">
          Created: {formatForDisplay(page.created_at)}
        </p>
        <p className="text-gray-600 dark:text-gray-200 text-sm">
          Updated: {formatForDisplay(page.updated_at)}
        </p>
        {page.deleted_at && (
          <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">
            ⏰ Expires: {formatForDisplay(page.deleted_at)}
          </p>
        )}
        {Boolean(isEncrypted) && (
          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
            🔒 This page is password protected
          </p>
        )}
      </div>

      {Boolean(isEncrypted) && decryptedContent == null ? (
        <PageViewDecryptForm
          password={password}
          setPassword={setPassword}
          decryptError={decryptError}
          decrypting={decrypting}
          handleDecrypt={handleDecrypt}
        />
      ) : (
        <>
          <PageViewContent viewMode={viewMode} content={displayContent} />
          <PageViewModeBar viewMode={viewMode} setViewMode={setViewMode} />
        </>
      )}
    </>
  );
}
