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

  categories: any[] = []; // Array to hold categories and their courses

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchCategories();
  }

  fetchCategories() {
    this.apiService.getCategoriesWithCourses().subscribe({
      next: (data) => {
        console.log('Raw data from API:', data); // Add this line
        this.categories = data.map((category: any) => {
          // Parse the courses JSON string into an array of objects
          category.courses = category.courses ? JSON.parse(`[${category.courses}]`) : [];
          // Use upcoming_image_thumbnail as thumbnail for display
          category.courses = category.courses.map((course: any) => ({
            ...course,
            thumbnail: course.upcoming_image_thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'
          }));
          return category;
        });
        console.log('Processed Categories:', this.categories); // Add this for verification
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }
}