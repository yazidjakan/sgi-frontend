import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UserDto } from './models/auth.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SGI - Système de Gestion des Incidents';
  currentUser: UserDto | null = null;

  constructor(private authService: AuthService) {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isManager(): boolean {
    return this.authService.isManager();
  }

  isTechnician(): boolean {
    return this.authService.isTechnician();
  }

  isUser(): boolean {
    return this.authService.isUser();
  }
}
