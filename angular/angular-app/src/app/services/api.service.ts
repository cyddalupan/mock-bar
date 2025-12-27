import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EncryptionService } from './encryption.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.API_BASE_URL;

  constructor(
    private http: HttpClient,
    private encryptionService: EncryptionService
  ) {}

  private postEncrypted(endpoint: string, payload: any): Observable<any> {
    const encryptedPayload = this.encryptionService.encrypt(payload);
    const headers = new HttpHeaders({
      'Content-Type': 'text/plain' // Send as plain text to avoid pre-flight CORS for application/json
    });

    return this.http.post(`${this.apiUrl}/${endpoint}`, encryptedPayload, { headers, responseType: 'text' }).pipe(
      map(response => this.encryptionService.decrypt(response)),
      catchError(error => {
        console.error('API call error:', error);
        let decryptedError = error.error;
        try {
          // Attempt to decrypt error response if it's encrypted
          decryptedError = this.encryptionService.decrypt(error.error);
        } catch (e) {
          // If decryption fails, use the raw error
          console.warn('Could not decrypt error response:', e);
        }
        return throwError(() => decryptedError || 'Server error');
      })
    );
  }

  getDbData(query: string, params: any[] = []): Observable<any> {
    const payload = { query, params };
    return this.postEncrypted('db.php', payload);
  }

  callAI(systemPrompt: string, history: any[]): Observable<any> {
    const payload = { system_prompt: systemPrompt, history: history };
    return this.postEncrypted('ai.php', payload);
  }
}
