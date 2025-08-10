import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = this.authService.currentUserValue;
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const hasRequiredRole = requiredRoles.some(role => 
      this.authService.hasRole(role)
    );

    if (hasRequiredRole) {
      return true;
    } else {
      // Rediriger vers la page appropriée selon le rôle de l'utilisateur
      if (this.authService.isAdmin()) {
        this.router.navigate(['/users']);
      } else if (this.authService.isManager()) {
        this.router.navigate(['/dashboard']);
      } else if (this.authService.isTechnician()) {
        this.router.navigate(['/assigned-tickets']);
      } else {
        this.router.navigate(['/tickets']);
      }
      return false;
    }
  }
}
