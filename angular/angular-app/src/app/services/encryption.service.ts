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
    const encrypted = CryptoJS.AES.encrypt(dataString, this.SECRET_KEY, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      // The IV is generated randomly and included in the ciphertext
      // This is crucial for security
      iv: CryptoJS.lib.WordArray.random(128 / 8) // 128-bit IV
    });
    // Return IV + ciphertext as a single base64 string
    return encrypted.toString();
  }

  decrypt(encryptedData: string): any {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        // The IV is derived from the encrypted data string by CryptoJS itself
      });
      if (decrypted.sigBytes <= 0) {
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
