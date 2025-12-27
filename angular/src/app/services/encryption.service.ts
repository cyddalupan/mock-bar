import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as jose from 'jose';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly SECRET_KEY_STRING = environment.ENCRYPTION_KEY;
  private secretKey: Uint8Array;

  constructor() {
    if (!this.SECRET_KEY_STRING || this.SECRET_KEY_STRING.length === 0) {
      console.error('EncryptionService: ENCRYPTION_KEY is not set in environment.ts.');
      this.secretKey = new Uint8Array(64).fill(0); // Create a dummy 64-byte key
    } else {
      try {
        // Use atob for standard Base64 decoding, then convert to Uint8Array
        const binaryString = atob(this.SECRET_KEY_STRING);
        this.secretKey = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          this.secretKey[i] = binaryString.charCodeAt(i);
        }

        if (this.secretKey.length !== 64) {
          console.error(`EncryptionService: ENCRYPTION_KEY (decoded) is not 64 bytes long. Got: ${this.secretKey.length} bytes.`);
          this.secretKey = new Uint8Array(64).fill(0); // Fallback to dummy key
        }
      } catch (e) {
        console.error('EncryptionService: Failed to decode ENCRYPTION_KEY from Base64 using atob(). Please check format.', e);
        this.secretKey = new Uint8Array(64).fill(0); // Fallback to dummy key
      }
    }
  }

  encrypt(data: any): Observable<string> {
    const dataString = JSON.stringify(data);
    const plaintext = new TextEncoder().encode(dataString);

    const jwePromise = new jose.CompactEncrypt(plaintext)
      .setProtectedHeader({ alg: 'dir', enc: 'A256CBC-HS512' })
      .encrypt(this.secretKey);
    
    return from(jwePromise);
  }

  decrypt(jweString: string): Observable<any> {
    const decryptPromise = jose.compactDecrypt(jweString, this.secretKey).then(result => {
      const decryptedString = new TextDecoder().decode(result.plaintext);
      return JSON.parse(decryptedString);
    });

    return from(decryptPromise);
  }
}