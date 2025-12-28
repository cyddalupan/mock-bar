import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../services/api.service';
import { forkJoin } from 'rxjs'; // Import forkJoin

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  protected readonly title = signal('Mock Bar App');

  allCourses: any[] = []; // Array to hold all courses flattened from categories
  userDiagAns: any[] = []; // To store diag_ans for the logged-in user
  quizQuestionsCount: { [courseId: string]: number } = {}; // To store total questions per course

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchAllData();
  }

  fetchAllData() {
    forkJoin({
      categoriesWithCourses: this.apiService.getCategoriesWithCourses(),
      diagAns: this.apiService.getDiagAnsForUser(),
      quizCounts: this.apiService.getQuizQuestionsCountPerCourse()
    }).subscribe({
      next: (results) => {
        // Process categories with courses
        let tempAllCourses: any[] = [];
        results.categoriesWithCourses.map((category: any) => {
          category.courses = category.courses.map((course: any) => ({
            ...course,
            category_name: category.category_name,
            thumbnail: course.upcoming_image_thumbnail || 'https://premierebarreview.com/mock/img/placeholder.jpg'
          }));
          tempAllCourses = tempAllCourses.concat(category.courses);
        });
        this.allCourses = tempAllCourses;

        // Store diag_ans data
        this.userDiagAns = results.diagAns;
        // console.log('User Diag Ans:', this.userDiagAns);

        // Store quiz questions count
        this.quizQuestionsCount = results.quizCounts.reduce((acc: any, curr: any) => {
          acc[curr.q_course_id] = curr.total_questions;
          return acc;
        }, {});
        // console.log('Quiz Questions Count:', this.quizQuestionsCount);

        // Now process allCourses to include progress and average score
        this.processCoursesForMetrics();
      },
      error: (error) => {
        console.error('Error fetching all data:', error);
      }
    });
  }

  processCoursesForMetrics() {
    this.allCourses = this.allCourses.map(course => {
      const courseId = course.id;
      const totalQuestions = this.quizQuestionsCount[courseId] || 0;

      const userAnswersForCourse = this.userDiagAns.filter(
        ans => ans.batch_id == courseId // Using == for potential type coercion with string/number IDs
      );

      const answeredQuestions = userAnswersForCourse.length;
      let progressText = `${answeredQuestions}/${totalQuestions} questions`;
      let progressBarPercentage = 0;

      if (totalQuestions > 0) {
        progressBarPercentage = (answeredQuestions / totalQuestions) * 100;
      }

      let averageScore = 0;
      if (answeredQuestions > 0) {
        const sumScores = userAnswersForCourse.reduce((sum, ans) => sum + ans.score, 0);
        averageScore = sumScores / answeredQuestions;
      }

      return {
        ...course,
        progressText,
        progressBarPercentage,
        averageScore: averageScore.toFixed(2) // Format to 2 decimal places
      };
    });
  }
}
