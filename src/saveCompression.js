/**
 * Save compression utilities using LZ-String
 * Provides both compression and backward compatibility with SimpleCrypto
 */
import LZString from 'lz-string';
import SimpleCrypto from 'simple-crypto-js';

// Crypto instance for save encryption/decryption
const crypt = new SimpleCrypto(import.meta.env.VITE_ENCRYPT_KEY);

/**
 * Compress game data using LZ-String and encrypt
 * @param {string} jsonString - Stringified game state
 * @returns {string} Encrypted compressed string (base64 encoded)
 */
export function compressSave(jsonString) {
  const compressed = LZString.compressToBase64(jsonString);
  return crypt.encrypt(compressed);
}

/**
 * Decompress game data
 * @param {string} encrypted - Encrypted compressed string
 * @returns {string} Decompressed JSON string
 */
export function decompressSave(encrypted) {
  let compressed = encrypted;
  try {
    const decrypted = crypt.decrypt(encrypted);
    if (typeof decrypted === 'string' && decrypted) {
      compressed = decrypted;
    }
  } catch (e) {
    // Fall back to treating it as an unencrypted compressed string (from the period it was broken)
  }
  return LZString.decompressFromBase64(compressed);
}

/**
 * Attempt to load save data, handling both new compressed format and legacy encrypted format
 * @param {string} saveString - Save data from storage
 * @returns {Object|null} Parsed game state or null if invalid
 */
export function loadSaveData(saveString) {
  if (!saveString) return null;

  try {
    // Try new compressed format first
    const decompressed = decompressSave(saveString);
    if (decompressed) {
      const parsed = JSON.parse(decompressed);
      return parsed;
    }
  } catch (e) {
    // Not compressed format, try legacy
  }

  try {
    // Try legacy SimpleCrypto format
    const decrypted = crypt.decrypt(saveString);
    if (decrypted && typeof decrypted === 'object') {
      console.log('📦 Migrated legacy encrypted save to compressed format');
      return decrypted;
    }
  } catch (e) {
    console.error('Failed to load save data:', e);
  }

  return null;
}

/**
 * Check if a save string is in old encrypted format
 * @param {string} saveString - Save data from storage
 * @returns {boolean} True if it's old format
 */
export function isLegacyFormat(saveString) {
  if (!saveString) return false;

  try {
    // LZ-String compressed data starts with specific characters
    // SimpleCrypto encrypted data has different structure
    const decompressed = decompressSave(saveString);
    return !decompressed;
  } catch {
    return true;
  }
}
