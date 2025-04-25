/**
 * Create password hash based on plain text and salt if provided
 * @param password string
 * @param salt string
 * @param iterations number
 * @returns string
 */
export async function hashPassword(
  password: string,
  salt?: string,
  iterations = 100_000,
): Promise<string> {
  // If no salt is provided, generate one (here using crypto.randomUUID).
  salt = salt ?? crypto.randomUUID();

  const enc = new TextEncoder();
  // Step 1: Import the plain-text password as raw key material.
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );

  // Step 2: Derive bits using PBKDF2 and the provided/created salt
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: enc.encode(salt),
      iterations,
    },
    keyMaterial,
    256, // bits
  );

  // derivedBits is an ArrayBuffer, so wrap it in a Uint8Array:
  const hashArray = new Uint8Array(derivedBits);

  // Step 3: Convert derived bits to hex
  const hashHex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Return in a salt:hashHex format
  return `${salt}:${hashHex}`;
}

/**
 * Check if the provided plain password and the hash matches
 * extracing salt of the hashedPassword
 * @param plainPassword string
 * @param storedHashValue string
 * @param iterations number
 * @returns boolean
 */
export async function verifyPassword(
  plainPassword: string,
  storedHashValue: string,
  iterations = 100_000,
): Promise<boolean> {
  // e.g., storedHashValue looks like `SALT:HASHHEX`
  const [salt, originalHex] = storedHashValue.split(':');
  if (!salt || !originalHex) {
    throw new Error('Invalid stored passwordHash format');
  }

  // Derive a new hash for the incoming plainPassword using the same salt
  const rehashed = await hashPassword(plainPassword, salt, iterations);
  // e.g. rehashed => `SALT:NEWHEX`

  // Compare the entire string
  return rehashed === `${salt}:${originalHex}`;
}
