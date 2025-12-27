import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule
import { MatIconModule } from '@angular/material/icon';     // Import MatIconModule
import { MatCardModule } from '@angular/material/card'; // Import MatCardModule
import { ApiService } from './services/api.service'; // Import ApiService

@Component({
  selector: 'app-root',
  standalone: true, // Mark as standalone
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule], // Add CommonModule, MatButtonModule, MatIconModule, and MatCardModule here
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
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
            thumbnail: course.upcoming_image_thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'
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