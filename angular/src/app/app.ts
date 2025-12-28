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
  template: `
    <div>
      <div class="banner-container">
        <img src="https://premierebarreview.com/mock/img/banner.jpg" alt="Mock Bar Banner" class="app-banner">
      </div>
      <router-outlet></router-outlet>
      <footer>
        <p>&copy; premierebarreview 2025</p>
      </footer>
    </div>
  `,
  styles: [] // Remove inline styles as they will go to styles.css
})
export class App {
  protected readonly title = signal('Mock Bar App');
}