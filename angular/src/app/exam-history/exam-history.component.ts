import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list'; // For lists if needed
import { MatToolbarModule } from '@angular/material/toolbar'; // For a title bar
import { SafeHtmlPipe } from '../safe-html-pipe'; // Import SafeHtmlPipe

import { ApiService, ExamHistoryEntry } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-exam-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule,
    MatListModule,
    MatToolbarModule,
    SafeHtmlPipe
  ],
  templateUrl: './exam-history.html',
  styleUrl: './exam-history.css',
})
export class ExamHistoryComponent implements OnInit {
  courseId: string | null = null;
  userId: string | null = null;
  historyEntries: ExamHistoryEntry[] = [];
  loading = true;
  error: string | null = null;
  panelOpenState = false; // For expansion panels

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('courseId');
    this.userId = this.authService.getUserId();

    if (!this.userId) {
      this.error = 'User not logged in. Please log in to view exam history.';
      this.loading = false;
      // Optionally redirect to login
      this.authService.redirectToLogin();
      return;
    }

    if (!this.courseId) {
      this.error = 'Course ID not found in route. Cannot fetch exam history.';
      this.loading = false;
      return;
    }

    this.fetchExamHistory();
  }

  fetchExamHistory(): void {
    if (this.userId && this.courseId) {
      this.loading = true;
      this.error = null;
      this.apiService.getExamHistory(this.userId, this.courseId).subscribe({
        next: (data) => {
          this.historyEntries = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching exam history:', err);
          this.error = 'Failed to load exam history. Please try again later.';
          this.loading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
