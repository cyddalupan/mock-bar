import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment'; // Import environment

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly SECRET_KEY = environment.ENCRYPTION_KEY;

  constructor() {
    if (this.SECRET_KEY === 'your_encryption_key' || !this.SECRET_KEY) {
      console.warn('EncryptionService: SECRET_KEY is not set or is using the default placeholder in environment.ts. Please update it.');
    }
  }

  encrypt(data: any): string {
    const dataString = JSON.stringify(data);
    const iv = CryptoJS.lib.WordArray.random(16); // 16 bytes = 128 bits for AES-256-CBC IV
    const keyHex = CryptoJS.enc.Base64.parse(this.SECRET_KEY); // Convert Base64 string key to WordArray
    const encrypted = CryptoJS.AES.encrypt(dataString, keyHex, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.ZeroPadding
    });
    // Concatenate IV and ciphertext as a Base64 string, matching PHP's format
    return CryptoJS.enc.Base64.stringify(iv.concat(encrypted.ciphertext));
  }

  decrypt(encryptedBase64: string): any {
    try {
      const decoded = CryptoJS.enc.Base64.parse(encryptedBase64); // Parse the base64 string
      const iv = CryptoJS.lib.WordArray.create(decoded.words.slice(0, 4)); // Extract first 16 bytes (4 words) as IV
      const ciphertext = CryptoJS.lib.WordArray.create(decoded.words.slice(4)); // Remaining is ciphertext

      const keyHex = CryptoJS.enc.Base64.parse(this.SECRET_KEY); // Convert Base64 string key to WordArray
      const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext } as CryptoJS.lib.CipherParams, keyHex, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.ZeroPadding
      });

      // --- DEBUGGING LOGS START ---
      console.log('DEBUG: decrypted.sigBytes', decrypted.sigBytes);
      if (decrypted.sigBytes > 0) {
        try {
          const possibleDecryptedString = decrypted.toString(CryptoJS.enc.Utf8);
          console.log('DEBUG: possibleDecryptedString (UTF8)', possibleDecryptedString);
        } catch (e) {
          console.error('DEBUG: Error converting decrypted bytes to UTF8 string', e);
        }
      }
      // --- DEBUGGING LOGS END ---

      if (decrypted.sigBytes <= 0) { // Check if decryption yielded any bytes
        throw new Error('Decryption failed or resulted in empty data.');
      }
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (e) {
      console.error('Decryption error:', e);
      return null;
    }
  }
}
