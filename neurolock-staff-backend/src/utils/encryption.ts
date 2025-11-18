import crypto from 'crypto';

/**
 * Envelope encryption utilities ported from Python crypto.py
 * Uses AES-256-GCM for data encryption with a KEK-wrapped DEK
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits authentication tag
const DEK_LENGTH = 32; // 256 bits

/**
 * Get the Key Encryption Key (KEK) from environment
 */
export function getKEK(): Buffer {
    const kekHex = process.env.KEK_HEX;
    if (!kekHex) {
        throw new Error('KEK_HEX not found in environment variables');
    }
    return Buffer.from(kekHex, 'hex');
}

/**
 * Generate a random Data Encryption Key (DEK)
 */
export function generateDEK(): Buffer {
    return crypto.randomBytes(DEK_LENGTH);
}

/**
 * Wrap (encrypt) a DEK using the KEK via AES Key Wrap (RFC 3394)
 */
export function wrapDEK(kek: Buffer, dek: Buffer): Buffer {
    const cipher = crypto.createCipheriv('id-aes256-wrap', kek, Buffer.alloc(8, 0xA6));
    const wrapped = Buffer.concat([cipher.update(dek), cipher.final()]);
    return wrapped;
}

/**
 * Unwrap (decrypt) a wrapped DEK using the KEK
 */
export function unwrapDEK(kek: Buffer, wrappedDEK: Buffer): Buffer {
    const decipher = crypto.createDecipheriv('id-aes256-wrap', kek, Buffer.alloc(8, 0xA6));
    const dek = Buffer.concat([decipher.update(wrappedDEK), decipher.final()]);
    return dek;
}

/**
 * Encrypt data using AES-256-GCM
 */
export function encryptData(
    plaintext: Buffer,
    dek: Buffer,
    associatedData?: Buffer
): { iv: Buffer; ciphertext: Buffer } {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, dek, iv);
    
    if (associatedData) {
        cipher.setAAD(associatedData);
    }
    
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();
    
    // Concatenate ciphertext and tag
    const ciphertext = Buffer.concat([encrypted, tag]);
    
    return { iv, ciphertext };
}

/**
 * Decrypt data using AES-256-GCM
 */
export function decryptData(
    iv: Buffer,
    ciphertext: Buffer,
    dek: Buffer,
    associatedData?: Buffer
): Buffer {
    // Split ciphertext and tag
    const encrypted = ciphertext.slice(0, -TAG_LENGTH);
    const tag = ciphertext.slice(-TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, dek, iv);
    decipher.setAuthTag(tag);
    
    if (associatedData) {
        decipher.setAAD(associatedData);
    }
    
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted;
}

/**
 * High-level function to encrypt a note with envelope encryption
 */
export function encryptNote(noteText: string): {
    dekWrapped: Buffer;
    iv: Buffer;
    ciphertext: Buffer;
} {
    const kek = getKEK();
    const dek = generateDEK();
    const wrappedDEK = wrapDEK(kek, dek);
    
    const plaintext = Buffer.from(noteText, 'utf-8');
    const { iv, ciphertext } = encryptData(plaintext, dek);
    
    return {
        dekWrapped: wrappedDEK,
        iv,
        ciphertext,
    };
}

/**
 * High-level function to decrypt a note
 */
export function decryptNote(
    dekWrapped: Buffer,
    iv: Buffer,
    ciphertext: Buffer
): string {
    const kek = getKEK();
    const dek = unwrapDEK(kek, dekWrapped);
    const plaintext = decryptData(iv, ciphertext, dek);
    return plaintext.toString('utf-8');
}
