export function PageViewDecryptForm({
  password,
  setPassword,
  decryptError,
  decrypting,
  handleDecrypt,
}: {
  password: string;
  setPassword: (pw: string) => void;
  decryptError: string | null;
  decrypting: boolean;
  handleDecrypt: (e: React.FormEvent) => void;
}) {
  return (
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

        {decryptError && <p className="text-red-600 text-sm">{decryptError}</p>}

        <button
          type="submit"
          disabled={decrypting || !password.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {decrypting ? "Decrypting..." : "Decrypt"}
        </button>
      </form>
    </div>
  );
}
