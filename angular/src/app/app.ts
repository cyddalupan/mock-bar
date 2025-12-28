import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule
import { MatIconModule } from '@angular/material/icon';     // Import MatIconModule
import { MatCardModule } from '@angular/material/card'; // Import MatCardModule
import { RouterOutlet } from '@angular/router'; // Import RouterOutlet
import { HeaderComponent } from './header/header.component'; // Import HeaderComponent

@Component({
  selector: 'app-root',
  standalone: true, // Mark as standalone
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, RouterOutlet, HeaderComponent], // Add RouterOutlet and HeaderComponent here
  template: `
    <div>
      <app-header></app-header>
      <router-outlet></router-outlet>
      <footer style="background-color: #1e6328; color: white; padding: 20px; text-align: center;">
        <p>&copy; premierebarreview 2025</p>
      </footer>
    </div>
  `,
  styles: [] // Remove inline styles as they will go to styles.css
})
export class App {
  protected readonly title = signal('Mock Bar App');
}