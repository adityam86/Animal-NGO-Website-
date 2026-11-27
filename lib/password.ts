import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LEN = 64;

// Precomputed static scrypt hash used for timing parity verification when user is nonexistent/inactive
export const DUMMY_SCRYPT_HASH =
  "scrypt$a1b2c3d4e5f60718293a4b5c6d7e8f90$5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8c0b2969315c1beec63364f9b233a7e78d2b992f915f05352c8bc762b33fffa76";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }

  const [, salt, hashHex] = parts;
  if (!salt || !hashHex) return false;

  try {
    const expected = Buffer.from(hashHex, "hex");
    const derived = (await scryptAsync(password, salt, expected.length)) as Buffer;
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * Runs a dummy scrypt verification against a static hash to eliminate timing side-channel
 * differences between existing and nonexistent accounts.
 */
export async function verifyDummyPassword(password: string): Promise<boolean> {
  return verifyPassword(password, DUMMY_SCRYPT_HASH);
}
