import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule
import { MatIconModule } from '@angular/material/icon';     // Import MatIconModule
import { MatCardModule } from '@angular/material/card'; // Import MatCardModule
import { Test } from './test/test'; // Import the new Test component

@Component({
  selector: 'app-root',
  standalone: true, // Mark as standalone
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, Test], // Add CommonModule, MatButtonModule, MatIconModule, MatCardModule, and Test here
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Mock Bar App');

  // Placeholder for courses
  courses = [
    {
      id: 1,
      title: 'Introduction to Angular',
      short_description: 'Learn the basics of Angular framework.',
      description: 'This course covers the fundamental concepts of Angular development, including components, services, routing, and forms.',
      thumbnail: 'https://via.placeholder.com/300x200?text=Angular+Course',
      price: 'Free',
      level: 'Beginner',
    },
    {
      id: 2,
      title: 'Advanced PHP API Development',
      short_description: 'Deep dive into building robust PHP APIs.',
      description: 'Explore advanced topics in PHP API development, including authentication, authorization, and database integration.',
      thumbnail: 'https://via.placeholder.com/300x200?text=PHP+API+Course',
      price: '$49.99',
      level: 'Intermediate',
    },
    {
      id: 3,
      title: 'Material Design with Angular',
      short_description: 'Build beautiful UIs with Angular Material.',
      description: 'Master the art of creating stunning user interfaces using Angular Material components and best practices.',
      thumbnail: 'https://via.placeholder.com/300x200?text=Material+Design',
      price: '$29.99',
      level: 'Beginner',
    },
    {
      id: 4,
      title: 'Database Design Fundamentals',
      short_description: 'Understand the principles of good database design.',
      description: 'Learn about relational database concepts, ER diagrams, normalization, and SQL optimization.',
      thumbnail: 'https://via.placeholder.com/300x200?text=Database+Design',
      price: '$39.99',
      level: 'Beginner',
    }
  ];

  constructor() {}
}