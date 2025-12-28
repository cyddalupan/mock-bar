import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideRouter, Routes, withComponentInputBinding, withHashLocation } from '@angular/router'; // Import provideRouter, Routes, and withComponentInputBinding
import { AuthGuard } from './auth.guard'; // Import AuthGuard
import { HomeComponent } from './home/home.component'; // Import HomeComponent

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirect root to /home
  {
    path: 'home',
    component: HomeComponent, // Use HomeComponent for the /home path
    canActivate: [AuthGuard] // Apply AuthGuard
  },
  // You can add more routes here as needed
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideAnimations(),
    provideRouter(routes, withComponentInputBinding(), withHashLocation()), // Add routing to providers, enable input binding for routes
    importProvidersFrom(MatButtonModule, MatIconModule)
  ]
};
