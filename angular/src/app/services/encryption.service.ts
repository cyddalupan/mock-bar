import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as jose from 'jose';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly SECRET_KEY_STRING = environment.ENCRYPTION_KEY;
  private secretKey: Uint8Array;

  constructor() {
    if (this.SECRET_KEY_STRING === 'your_encryption_key' || !this.SECRET_KEY_STRING || this.SECRET_KEY_STRING.length !== 32) {
      console.error('EncryptionService: A 32-character (256-bit) ENCRYPTION_KEY is not set in environment.ts. Please update it.');
      // Create a dummy key to avoid further errors, but encryption will not work.
      this.secretKey = new TextEncoder().encode(''.padStart(32, '0'));
    } else {
      this.secretKey = new TextEncoder().encode(this.SECRET_KEY_STRING);
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