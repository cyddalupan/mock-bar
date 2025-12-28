import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly LOGIN_URL = 'https://premierebarreview.com/bar-review/login';
  private readonly LOCAL_STORAGE_USER_ID_KEY = 'user_id';
  private readonly LOCAL_STORAGE_DOMAIN = 'https://premierebarreview.com'; // Not directly used by localStorage, but for context

  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    // Check if localStorage is available (e.g., not server-side rendering)
    if (typeof localStorage !== 'undefined') {
      const userId = localStorage.getItem(this.LOCAL_STORAGE_USER_ID_KEY);
      // In a real application, you might also validate the user_id (e.g., check its format or expiration)
      return !!userId; // Returns true if userId exists and is not empty, false otherwise
    }
    return false; // Assume not logged in if localStorage is not available
  }

  redirectToLogin(): void {
    window.location.href = this.LOGIN_URL;
  }

  getUserId(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.LOCAL_STORAGE_USER_ID_KEY);
    }
    return null;
  }
}
