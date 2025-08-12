import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const required = (route.data['roles'] as string[] | undefined) ?? [];
    if (required.length === 0) return true;

    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    if (this.auth.hasAnyRole(required)) return true;

    if (this.auth.isAdmin()) this.router.navigate(['/users']);
    else if (this.auth.isManager()) this.router.navigate(['/dashboard']);
    else if (this.auth.isTechnician()) this.router.navigate(['/assigned-tickets']);
    else this.router.navigate(['/tickets']);
    return false;
  }
}