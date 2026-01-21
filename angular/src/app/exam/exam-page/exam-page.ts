import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // Import DomSanitizer and SafeHtml

@Component({
  selector: 'app-exam-page',
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
  templateUrl: './exam-page.html',
  styleUrl: './exam-page.css',
})
export class ExamPageComponent implements OnInit {
  courseId!: string;
  userId!: string | null;
  currentQuestion: any;
  userAnswer: string = '';
  gradeResult: any;
  isLoading: boolean = false;
  error: string | null = null;
  examCompleted: boolean = false;
  showResult: boolean = false;
  expectedAnswerFromAI: string | null = null;
  currentGradingMethodName: string | null = null;
  currentGradingMethodId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private sanitizer: DomSanitizer // Inject DomSanitizer
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
      this.loadNextQuestion();
    });
  }

  loadNextQuestion() {
    this.isLoading = true;
    this.error = null;
    this.userAnswer = '';
    this.gradeResult = null;
    this.showResult = false;
    this.expectedAnswerFromAI = null;
    this.currentGradingMethodName = null; // Reset
    this.currentGradingMethodId = null; // Reset

    if (!this.userId || !this.courseId) {
      this.error = 'Missing user ID or course ID.';
      this.isLoading = false;
      return;
    }

    this.apiService.getNextQuestion(this.courseId, this.userId).subscribe({
      next: (response) => {
        if (response && response.length > 0) {
          this.currentQuestion = response[0];
          this.examCompleted = false;

          // Fetch grading method name if ID is available
          if (this.currentQuestion.grading_method_id) {
            this.currentGradingMethodId = this.currentQuestion.grading_method_id;
            this.apiService.getGradingMethodById(this.currentGradingMethodId).subscribe({
              next: (method) => {
                if (method && method.name) {
                  this.currentGradingMethodName = method.name;
                }
              },
              error: (err) => {
                console.error('Error fetching grading method name:', err);
                this.currentGradingMethodName = 'Default'; // Fallback
              }
            });
          } else {
            this.currentGradingMethodName = 'Default'; // Default if no ID
            this.currentGradingMethodId = 0; // Explicitly set to 0 when no ID
          }

        } else {
          this.currentQuestion = null;
          this.examCompleted = true;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading next question:', err);
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

    this.apiService.gradeAnswer(this.userAnswer, this.currentQuestion.q_answer, this.currentGradingMethodId).subscribe({
      next: (aiResponse) => {
        // AI response might be nested
        const content = aiResponse.choices[0]?.message?.content;
        if (content) {
          try {
            const parsedContent = JSON.parse(content);
            this.gradeResult = parsedContent;

            // Extract expected_answer from the "Additional Insights" section if available
            const insightsRegex = /Additional Insights:[\s\S]*?a\)\s*The correct expected_answer:\s*([\s\S]*?)\s*b\)/;
            const match = insightsRegex.exec(this.gradeResult.feedback);
            if (match && match[1]) {
              this.expectedAnswerFromAI = match[1].trim();
            }

            this.apiService.saveDiagAns(
              this.userId!,
              this.courseId,
              this.currentQuestion.q_id,
              this.userAnswer,
              this.gradeResult.score,
              this.gradeResult.feedback
            ).subscribe({
              next: (dbResponse) => {
                // console.log('Answer saved to DB:', dbResponse);
                this.showResult = true;
                this.isLoading = false;
              },
              error: (dbErr) => {
                console.error('Error saving answer to DB:', dbErr);
                this.error = 'Answer graded, but failed to save to database.';
                this.showResult = true; // Still show AI result even if DB save fails
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
      error: (err) => {
        console.error('Error grading answer with AI:', err);
        this.error = 'Failed to get AI grading. Please try again.';
        this.isLoading = false;
      }
    });
  }

  getSafeFeedbackHtml(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.gradeResult?.feedback || '');
  }

  continueToNextQuestion() {
    this.loadNextQuestion();
  }

  goBackToHome() {
    this.router.navigate(['/home']);
  }
}
