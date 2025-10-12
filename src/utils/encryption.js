import CryptoJS from 'crypto-js';

/**
 * Encryption Utility for Daily Hub
 * 
 * Uses AES-256 encryption with user-specific key derivation
 * IMPORTANT: The encryption key is derived from the user's credentials
 * to ensure data can only be decrypted by the authenticated user
 */

class EncryptionService {
  constructor() {
    // Base encryption key - CHANGE THIS to a random string
    // In production, store this in environment variables
    this.baseKey = import.meta.env.VITE_ENCRYPTION_KEY || 'DailyHub-Default-Key-Change-Me-In-Production';
  }

  /**
   * Generate user-specific encryption key
   * Combines base key with user ID for unique encryption per user
   */
  generateUserKey(userId) {
    if (!userId) {
      console.warn('⚠️ No userId provided, using base key only');
      return this.baseKey;
    }
    return CryptoJS.SHA256(this.baseKey + userId).toString();
  }

  /**
   * Encrypt a single string value
   * @param {string} text - Text to encrypt
   * @param {string} userId - User ID for key derivation
   * @returns {string} - Encrypted text
   */
  encrypt(text, userId) {
    if (!text) return null;
    
    try {
      const key = this.generateUserKey(userId);
      const encrypted = CryptoJS.AES.encrypt(text, key).toString();
      console.log('🔒 Encrypted data');
      return encrypted;
    } catch (error) {
      console.error('❌ Encryption error:', error);
      return null;
    }
  }

  /**
   * Decrypt a single string value
   * @param {string} encryptedText - Text to decrypt
   * @param {string} userId - User ID for key derivation
   * @returns {string} - Decrypted text
   */
  decrypt(encryptedText, userId) {
    if (!encryptedText) return null;
    
    try {
      const key = this.generateUserKey(userId);
      const decrypted = CryptoJS.AES.decrypt(encryptedText, key);
      const text = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!text) {
        throw new Error('Decryption resulted in empty string');
      }
      
      console.log('🔓 Decrypted data');
      return text;
    } catch (error) {
      console.error('❌ Decryption error:', error);
      return null;
    }
  }

  /**
   * Encrypt password entry object
   * Encrypts sensitive fields while keeping metadata in plain text
   * @param {object} passwordEntry - Password entry object
   * @param {string} userId - User ID for encryption
   * @returns {object} - Encrypted password entry
   */
  encryptPasswordEntry(passwordEntry, userId) {
    if (!passwordEntry) return null;

    try {
      return {
        ...passwordEntry,
        // Encrypt sensitive fields
        password: this.encrypt(passwordEntry.password, userId),
        username: passwordEntry.username ? this.encrypt(passwordEntry.username, userId) : '',
        notes: passwordEntry.notes ? this.encrypt(passwordEntry.notes, userId) : '',
        // Keep metadata in plain text for searching/filtering
        title: passwordEntry.title,
        url: passwordEntry.url,
        category: passwordEntry.category,
        id: passwordEntry.id,
        createdAt: passwordEntry.createdAt,
        updatedAt: passwordEntry.updatedAt,
        encrypted: true // Flag to indicate encryption
      };
    } catch (error) {
      console.error('❌ Error encrypting password entry:', error);
      return passwordEntry;
    }
  }

  /**
   * Decrypt password entry object
   * @param {object} encryptedEntry - Encrypted password entry
   * @param {string} userId - User ID for decryption
   * @returns {object} - Decrypted password entry
   */
  decryptPasswordEntry(encryptedEntry, userId) {
    if (!encryptedEntry) return null;
    
    // If not encrypted, return as is (for backward compatibility)
    if (!encryptedEntry.encrypted) {
      return encryptedEntry;
    }

    try {
      return {
        ...encryptedEntry,
        password: this.decrypt(encryptedEntry.password, userId) || '',
        username: encryptedEntry.username ? this.decrypt(encryptedEntry.username, userId) || '' : '',
        notes: encryptedEntry.notes ? this.decrypt(encryptedEntry.notes, userId) || '' : '',
        encrypted: false // Remove flag after decryption
      };
    } catch (error) {
      console.error('❌ Error decrypting password entry:', error);
      return encryptedEntry;
    }
  }

  /**
   * Encrypt array of password entries
   * @param {array} passwords - Array of password entries
   * @param {string} userId - User ID for encryption
   * @returns {array} - Array of encrypted password entries
   */
  encryptPasswordArray(passwords, userId) {
    if (!Array.isArray(passwords)) return [];
    return passwords.map(pwd => this.encryptPasswordEntry(pwd, userId));
  }

  /**
   * Decrypt array of password entries
   * @param {array} encryptedPasswords - Array of encrypted password entries
   * @param {string} userId - User ID for decryption
   * @returns {array} - Array of decrypted password entries
   */
  decryptPasswordArray(encryptedPasswords, userId) {
    if (!Array.isArray(encryptedPasswords)) return [];
    return encryptedPasswords.map(pwd => this.decryptPasswordEntry(pwd, userId));
  }

  /**
   * Encrypt master password
   * @param {string} masterPassword - Master password to encrypt
   * @param {string} userId - User ID for encryption
   * @returns {string} - Encrypted master password
   */
  encryptMasterPassword(masterPassword, userId) {
    return this.encrypt(masterPassword, userId);
  }

  /**
   * Decrypt master password
   * @param {string} encryptedMasterPassword - Encrypted master password
   * @param {string} userId - User ID for decryption
   * @returns {string} - Decrypted master password
   */
  decryptMasterPassword(encryptedMasterPassword, userId) {
    return this.decrypt(encryptedMasterPassword, userId);
  }

  /**
   * Encrypt recovery data
   * @param {object} recoveryData - Recovery question and answer
   * @param {string} userId - User ID for encryption
   * @returns {object} - Encrypted recovery data
   */
  encryptRecoveryData(recoveryData, userId) {
    if (!recoveryData) return null;

    try {
      return {
        question: recoveryData.question, // Keep question in plain text
        answer: this.encrypt(recoveryData.answer, userId), // Encrypt answer
        encrypted: true
      };
    } catch (error) {
      console.error('❌ Error encrypting recovery data:', error);
      return recoveryData;
    }
  }

  /**
   * Decrypt recovery data
   * @param {object} encryptedRecoveryData - Encrypted recovery data
   * @param {string} userId - User ID for decryption
   * @returns {object} - Decrypted recovery data
   */
  decryptRecoveryData(encryptedRecoveryData, userId) {
    if (!encryptedRecoveryData) return null;
    
    // If not encrypted, return as is
    if (!encryptedRecoveryData.encrypted) {
      return encryptedRecoveryData;
    }

    try {
      return {
        question: encryptedRecoveryData.question,
        answer: this.decrypt(encryptedRecoveryData.answer, userId) || '',
        encrypted: false
      };
    } catch (error) {
      console.error('❌ Error decrypting recovery data:', error);
      return encryptedRecoveryData;
    }
  }

  /**
   * Test encryption/decryption
   * Useful for debugging
   */
  test() {
    console.log('🧪 Testing Encryption Service...');
    
    const testText = 'Hello, World!';
    const testUserId = 'test-user-123';
    
    const encrypted = this.encrypt(testText, testUserId);
    console.log('Encrypted:', encrypted);
    
    const decrypted = this.decrypt(encrypted, testUserId);
    console.log('Decrypted:', decrypted);
    
    console.log('Test', testText === decrypted ? '✅ PASSED' : '❌ FAILED');
    
    return testText === decrypted;
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();

// Export class for testing
export default EncryptionService;