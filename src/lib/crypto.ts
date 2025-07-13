/**
 * Client-side encryption/decryption utilities using Web Crypto API
 *
 * Uses AES-GCM (Advanced Encryption Standard - Galois/Counter Mode) for authenticated encryption
 * and PBKDF2 (Password-Based Key Derivation Function 2) for secure key derivation.
 *
 * Security features:
 * - Random salt prevents rainbow table attacks
 * - Random IV ensures same content encrypts differently each time
 * - PBKDF2 with 100,000 iterations makes brute force attacks expensive
 * - AES-GCM provides both encryption and authentication (tamper detection)
 */

/**
 * Derives a cryptographic key from a password using PBKDF2
 * @param password - User-provided password
 * @param salt - Random 16-byte salt to prevent rainbow table attacks
 * @returns CryptoKey suitable for AES-GCM encryption/decryption
 */
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  // Convert password string to bytes for cryptographic operations
  const encoder = new TextEncoder();

  // Import the password as key material for PBKDF2
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  // Derive a 256-bit AES key using PBKDF2
  // High iteration count (100,000) makes brute force attacks computationally expensive
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt, // Random salt prevents precomputed attacks
      iterations: 100000, // High iteration count for security
      hash: "SHA-256", // Hash function for key derivation
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 }, // Output: 256-bit AES key
    false, // Key is not extractable
    ["encrypt", "decrypt"] // Key can be used for encryption/decryption
  );
}

/**
 * Encrypts text content using AES-GCM with password-based key derivation
 * @param content - Plaintext content to encrypt
 * @param password - User-provided password for encryption
 * @returns Base64-encoded string in format "salt:iv:ciphertext"
 */
export async function encryptContent(
  content: string,
  password: string
): Promise<string> {
  // Step 1: Convert content string to bytes for encryption
  const encoder = new TextEncoder();
  const data = encoder.encode(content);

  // Step 2: Generate cryptographically secure random values
  // Salt: 16 bytes for PBKDF2 key derivation (prevents rainbow table attacks)
  // IV: 12 bytes for AES-GCM encryption (ensures same content encrypts differently)
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Step 3: Derive encryption key from password using PBKDF2
  // Uses the random salt to ensure same password produces different keys
  const key = await deriveKey(password, salt);

  // Step 4: Encrypt the content using AES-GCM
  // AES-GCM provides both confidentiality (encryption) and integrity (authentication)
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    data
  );

  // Step 5: Encode binary data to base64 strings for storage
  // Convert each component to base64 to safely store in text database
  const saltB64 = btoa(String.fromCharCode(...salt));
  const ivB64 = btoa(String.fromCharCode(...iv));
  const encryptedB64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

  // Step 6: Return in format "salt:iv:ciphertext" for storage
  // This format allows us to reconstruct all components needed for decryption
  return `${saltB64}:${ivB64}:${encryptedB64}`;
}

/**
 * Decrypts AES-GCM encrypted content using password-based key derivation
 * @param encryptedContent - Base64-encoded string in format "salt:iv:ciphertext"
 * @param password - User-provided password for decryption (must match encryption password)
 * @returns Decrypted plaintext content
 * @throws Error if format is invalid, password is wrong, or data is tampered with
 */
export async function decryptContent(
  encryptedContent: string,
  password: string
): Promise<string> {
  // Step 1: Parse the stored format "salt:iv:ciphertext"
  // Split the base64-encoded components that were stored during encryption
  const [saltB64, ivB64, encryptedB64] = encryptedContent.split(":");

  // Step 2: Validate format - ensure all required components are present
  if (!saltB64 || !ivB64 || !encryptedB64) {
    throw new Error("Invalid encrypted content format");
  }

  // Step 3: Decode base64 strings back to binary data
  // Convert each base64 component back to Uint8Array for cryptographic operations
  const salt = new Uint8Array(
    atob(saltB64)
      .split("")
      .map((c) => c.charCodeAt(0))
  );
  const iv = new Uint8Array(
    atob(ivB64)
      .split("")
      .map((c) => c.charCodeAt(0))
  );
  const encrypted = new Uint8Array(
    atob(encryptedB64)
      .split("")
      .map((c) => c.charCodeAt(0))
  );

  // Step 4: Derive the same key used for encryption
  // Uses the stored salt and provided password to recreate the exact same key
  const key = await deriveKey(password, salt);

  // Step 5: Decrypt the content using AES-GCM
  // AES-GCM will automatically verify the authentication tag
  // Will throw an error if password is wrong or data has been tampered with
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encrypted
  );

  // Step 6: Convert decrypted bytes back to readable text
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
