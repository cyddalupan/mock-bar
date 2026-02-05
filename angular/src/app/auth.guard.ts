import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const courseId = route.paramMap.get('courseId');

    // Allow access if courseId is '0' (for free practice exams)
    if (courseId === '0') {
      return true;
    }

    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.authService.redirectToLogin();
      return false;
    }
  }
}
