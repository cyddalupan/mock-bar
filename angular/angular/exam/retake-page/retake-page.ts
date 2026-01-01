import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../src/app/services/api.service'; // Corrected path to be relative to angular/angular
import { AuthService } from '../../../src/app/services/auth.service'; // Corrected path to be relative to angular/angular
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-retake-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    FormsModule,
    MatProgressBarModule
  ],
  templateUrl: './retake-page.html',
  styleUrl: './retake-page.css',
})
export class RetakePageComponent implements OnInit {
  courseId!: string;
  questionId!: string;
  userId!: string | null;
  currentQuestion: any;
  userAnswer: string = '';
  gradeResult: any;
  isLoading: boolean = false;
  error: string | null = null;
  showResult: boolean = false;
  expectedAnswerFromAI: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private sanitizer: DomSanitizer, // Corrected typo
  ) {}

  ngOnInit() {
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      this.error = 'User not logged in. Redirecting to home.';
      this.router.navigate(['/home']);
      return;
    }

    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('courseId')!;
      this.questionId = params.get('questionId')!;
      this.loadQuestion();
    });
  }

  loadQuestion() {
    this.isLoading = true;
    this.error = null;
    this.userAnswer = '';
    this.gradeResult = null;
    this.showResult = false;
    this.expectedAnswerFromAI = null;

    if (!this.userId || !this.courseId || !this.questionId) {
      this.error = 'Missing user ID, course ID, or question ID.';
      this.isLoading = false;
      return;
    }

    this.apiService.getQuestionById(this.questionId).subscribe({
      next: (response: any[]) => { // Explicitly typed
        if (response && response.length > 0) {
          this.currentQuestion = response[0];
        } else {
          this.error = 'Question not found.';
        }
        this.isLoading = false;
      },
      error: (err: any) => { // Explicitly typed
        console.error('Error loading question:', err);
        this.error = 'Failed to load question. Please try again.';
        this.isLoading = false;
      }
    });
  }

  submitAnswer() {
    if (!this.userAnswer.trim() || !this.currentQuestion) {
      this.error = 'Please provide an answer.';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.gradeResult = null;
    this.showResult = false;
    this.expectedAnswerFromAI = null;

    this.apiService.gradeAnswer(this.userAnswer, this.currentQuestion.q_answer).subscribe({
      next: (aiResponse: any) => { // Explicitly typed
        const content = aiResponse.choices[0]?.message?.content;
        if (content) {
          try {
            const parsedContent = JSON.parse(content);
            this.gradeResult = parsedContent;

            const insightsRegex = /Additional Insights:[\s\S]*?a\)\s*The correct expected_answer:\s*([\s\S]*?)\s*b\)/;
            const match = insightsRegex.exec(this.gradeResult.feedback);
            if (match && match[1]) {
              this.expectedAnswerFromAI = match[1].trim();
            }

            // Call the new saveRetakeAnswer method
            this.apiService.saveRetakeAnswer(
              this.userId!,
              this.courseId,
              this.currentQuestion.q_id,
              this.userAnswer,
              this.gradeResult.score,
              this.gradeResult.feedback
            ).subscribe({
              next: (dbResponse: any) => { // Explicitly typed
                this.showResult = true;
                this.isLoading = false;
              },
              error: (dbErr: any) => { // Explicitly typed
                console.error('Error saving retake answer to DB:', dbErr);
                this.error = 'Answer graded, but failed to save retake to database.';
                this.showResult = true;
                this.isLoading = false;
              }
            });

          } catch (jsonError) {
            console.error('Error parsing AI response content:', jsonError);
            this.error = 'Failed to parse AI grading response.';
            this.isLoading = false;
          }
        } else {
          this.error = 'AI did not return a valid grading response.';
          this.isLoading = false;
        }
      },
      error: (err: any) => { // Explicitly typed
        console.error('Error grading answer with AI:', err);
        this.error = 'Failed to get AI grading. Please try again.';
        this.isLoading = false;
      }
    });
  }

  getSafeFeedbackHtml(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.gradeResult?.feedback || '');
  }

  goBackToHistory(): void {
    this.router.navigate(['/history', this.courseId]);
  }
}
