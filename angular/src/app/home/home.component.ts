import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../services/api.service';

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

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchCategories();
  }

  fetchCategories() {
    this.apiService.getCategoriesWithCourses().subscribe({
      next: (data) => {
        let tempAllCourses: any[] = []; // Temporary array to hold all courses

        data.map((category: any) => {
          // Parse the courses JSON string into an array of objects
          category.courses = category.courses ? JSON.parse(`[${category.courses}]`) : [];
          // Use upcoming_image_thumbnail as thumbnail for display
          category.courses = category.courses.map((course: any) => ({
            ...course,
            category_name: category.category_name, // Add category name to each course
            thumbnail: course.upcoming_image_thumbnail || 'https://premierebarreview.com/mock/img/placeholder.jpg'
          }));
          // Add processed courses to the temporary array
          tempAllCourses = tempAllCourses.concat(category.courses);
          return category; // This return is technically not used, as we are flattening outside
        });
        this.allCourses = tempAllCourses; // Assign the flattened array to allCourses
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }
}
