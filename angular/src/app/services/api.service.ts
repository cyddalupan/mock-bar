import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
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
    const headers = new HttpHeaders({
      'Content-Type': 'application/jose' // Use the standard content type for JWE
    });

    return this.encryptionService.encrypt(payload).pipe(
      switchMap(encryptedPayload => {
        return this.http.post(`${this.apiUrl}/${endpoint}`, encryptedPayload, { headers, responseType: 'text' });
      }),
      switchMap(response => {
        if (response) {
          return this.encryptionService.decrypt(response);
        }
        return throwError(() => 'Empty response from server');
      }),
      catchError(error => {
        console.error('API call error:', error);
        // The error from the HTTP call or decryption will be passed through here.
        // It's better to handle the error in the component that calls the service.
        return throwError(() => error);
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
