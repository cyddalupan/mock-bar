import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators'; // No need for switchMap now
import { environment } from '../../environments/environment';

import { AuthService } from './auth.service'; // Import AuthService

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.API_BASE_URL;

  constructor(
    private http: HttpClient,
    private authService: AuthService, // Inject AuthService
  ) {}

  // Helper to get userId
  getUserId(): string | null {
    return this.authService.getUserId();
  }

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

  // New method to call AI for grading
  gradeAnswer(userAnswer: string, expectedAnswer: string): Observable<any> {
    const payload = { user_answer: userAnswer, expected_answer: expectedAnswer };
    return this.postData('ai.php', payload);
  }

  // New method to get the next unanswered question for a course
  getNextQuestion(courseId: string, userId: string): Observable<any> {
    const query = `
      SELECT q_id, q_question, q_answer
      FROM quiz_new
      WHERE q_course_id = ?
        AND q_id NOT IN (SELECT question_id FROM diag_ans WHERE user_id = ? AND batch_id = ?)
      ORDER BY q_id ASC
      LIMIT 1;
    `;
    const params = [courseId, userId, courseId];
    return this.getDbData(query, params);
  }

  // New method to save graded answer to diag_ans
  saveDiagAns(userId: string, courseId: string, questionId: string, answer: string, score: number, feedback: string): Observable<any> {
    const query = `
      INSERT INTO diag_ans (user_id, batch_id, question_id, answer, score, feedback, date_created)
      VALUES (?, ?, ?, ?, ?, ?, NOW());
    `;
    const params = [userId, courseId, questionId, answer, score, feedback];
    return this.getDbData(query, params);
  }

  // New method to get exam status for a specific course for the current user
  getExamStatusForCourse(courseId: string, userId: string): Observable<{completed: boolean, answeredCount: number, totalQuestions: number}> {
    const query = `
      SELECT
        (SELECT COUNT(q_id) FROM quiz_new WHERE q_course_id = ?) AS total_questions,
        (SELECT COUNT(question_id) FROM diag_ans WHERE user_id = ? AND batch_id = ?) AS answered_questions;
    `;
    const params = [courseId, userId, courseId];
    return this.getDbData(query, params).pipe( // Corrected: pass params here
      map(response => {
        const totalQuestions = response[0]?.total_questions || 0;
        const answeredQuestions = response[0]?.answered_questions || 0;
        return {
          completed: totalQuestions > 0 && answeredQuestions >= totalQuestions,
          answeredCount: answeredQuestions,
          totalQuestions: totalQuestions
        };
      })
    );
  }

  // New method to get detailed diag_ans for a user, including the answer
  getDiagAnsDetailForUser(userId: string, courseId: string): Observable<any> {
    const query = `
      SELECT id, batch_id, question_id, answer, score, feedback, date_created
      FROM diag_ans
      WHERE user_id = ? AND batch_id = ?;
    `;
    const params = [userId, courseId];
    return this.getDbData(query, params);
  }

  getDiagAnsForUser(): Observable<any> {
    const userId = this.getUserId();
    if (!userId) {
      // Handle the case where user is not logged in or userId is not available
      console.error('User ID not found. Cannot fetch diag_ans.');
      return throwError(() => new Error('User not logged in.'));
    }

    const query = `
      SELECT batch_id, question_id, score
      FROM diag_ans
      WHERE user_id = ?;
    `;
    const params = [userId];
    return this.getDbData(query, params);
  }

  getQuizQuestionsCountPerCourse(): Observable<any> {
    const query = `
      SELECT q_course_id, COUNT(q_id) AS total_questions
      FROM quiz_new
      GROUP BY q_course_id;
    `;
    return this.getDbData(query);
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