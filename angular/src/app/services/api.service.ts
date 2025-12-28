import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'; // No need for switchMap now
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.API_BASE_URL;

  constructor(
    private http: HttpClient,
  ) {}

  private postData(endpoint: string, payload: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json' // Send plain JSON
    });

    return this.http.post(`${this.apiUrl}/${endpoint}`, payload, { headers }).pipe( // Expect plain JSON response
      catchError(error => {
        console.error('API call error:', error);
        // Direct error from HTTP call, no decryption needed
        return throwError(() => error.error || 'Server error');
      })
    );
  }

  getDbData(query: string, params: any[] = []): Observable<any> {
    const payload = { query, params };
    return this.postData('db.php', payload);
  }

  callAI(systemPrompt: string, history: any[]): Observable<any> {
    const payload = { system_prompt: systemPrompt, history: history };
    return this.postData('ai.php', payload);
  }

    getCategoriesWithCourses(): Observable<any> {

      const query = `
        /* AGGREGATE_COURSES */
        SELECT
            c.id AS category_id,
            c.name AS category_name,
            co.id,
            co.title,
            co.short_description,
            co.upcoming_image_thumbnail,
            co.price,
            co.level
        FROM
            category c
        LEFT JOIN
            course co ON c.id = co.category_id
        ORDER BY
            c.name, co.id;
      `;

      return this.getDbData(query);

    }
}