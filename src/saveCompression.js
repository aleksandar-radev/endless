/**
 * Save compression utilities using LZ-String
 * Provides both compression and backward compatibility with SimpleCrypto
 */
import LZString from 'lz-string';
import SimpleCrypto from 'simple-crypto-js';

// SimpleCrypto instance for legacy save migration
const legacyCrypt = new SimpleCrypto(import.meta.env.VITE_ENCRYPT_KEY);

/**
 * Compress game data using LZ-String
 * @param {string} jsonString - Stringified game state
 * @returns {string} Compressed string (base64 encoded)
 */
export function compressSave(jsonString) {
  return LZString.compressToBase64(jsonString);
}

/**
 * Decompress game data
 * @param {string} compressed - Compressed string
 * @returns {string} Decompressed JSON string
 */
export function decompressSave(compressed) {
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
    const decrypted = legacyCrypt.decrypt(saveString);
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
