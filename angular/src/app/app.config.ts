import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideRouter, Routes, withComponentInputBinding, withHashLocation } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { HomeComponent } from './home/home.component';
import { ExamPageComponent } from './exam/exam-page/exam-page';
import { ExamHistoryComponent } from './exam-history/exam-history.component'; // Import ExamHistoryComponent
import { RetakePageComponent } from '../../angular/exam/retake-page/retake-page'; // Import RetakePageComponent

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'exam/:courseId',
    component: ExamPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'history/:courseId', // New route for exam history page with courseId parameter
    component: ExamHistoryComponent,
    canActivate: [AuthGuard] // Protect the history route
  },
  {
    path: 'history/retake/:courseId/:questionId',
    component: RetakePageComponent,
    canActivate: [AuthGuard]
  }
]; // Corrected: closing bracket for routes array

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideAnimations(),
    provideRouter(routes, withComponentInputBinding(), withHashLocation()),
    importProvidersFrom(MatButtonModule, MatIconModule)
  ]
};
