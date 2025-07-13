import { useState } from "react";
import { formatForDisplay } from "../lib/dates";
import type { Page } from "../types";
import { decryptContent } from "../lib/crypto";

interface Props {
  page: Page;
}

export function PageView({ page }: Props) {
  const [password, setPassword] = useState("");
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);

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

  return (
    <>
      <div className="mb-4">
        <p className="text-gray-600 text-sm">
          Created: {formatForDisplay(page.created_at)}
        </p>
        <p className="text-gray-600 text-sm">
          Updated: {formatForDisplay(page.updated_at)}
        </p>
        {Boolean(isEncrypted) && (
          <p className="text-blue-600 text-sm font-medium">
            🔒 This page is password protected
          </p>
        )}
      </div>

      {Boolean(isEncrypted) && decryptedContent == null ? (
        <div className="max-w-md">
          <form onSubmit={handleDecrypt} className="space-y-4">
            <div>
              <label
                htmlFor="decrypt-password"
                className="block text-sm font-medium mb-2"
              >
                Enter password to view this page:
              </label>
              <input
                type="password"
                id="decrypt-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {decryptError && (
              <p className="text-red-600 text-sm">{decryptError}</p>
            )}

            <button
              type="submit"
              disabled={decrypting || !password.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {decrypting ? "Decrypting..." : "Decrypt"}
            </button>
          </form>
        </div>
      ) : (
        <div className="max-w-none">
          <p className="whitespace-pre-wrap">
            {isEncrypted ? decryptedContent : page.content}
          </p>
        </div>
      )}
    </>
  );
}
