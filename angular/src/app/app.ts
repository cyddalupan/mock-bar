import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule
import { MatIconModule } from '@angular/material/icon';     // Import MatIconModule
import { MatCardModule } from '@angular/material/card'; // Import MatCardModule
import { RouterOutlet } from '@angular/router'; // Import RouterOutlet

@Component({
  selector: 'app-root',
  standalone: true, // Mark as standalone
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, RouterOutlet], // Add RouterOutlet here
  templateUrl: './app.html' // Use router-outlet for routing content
})
export class App {
  protected readonly title = signal('Mock Bar App');
}