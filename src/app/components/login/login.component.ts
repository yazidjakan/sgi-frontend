import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.loading = false;
          this.toastr.success('Connexion réussie', 'Bienvenue !');
          
          // Redirection selon le rôle
          if (this.authService.isAdmin()) {
            this.router.navigate(['/users']);
          } else if (this.authService.isManager()) {
            this.router.navigate(['/dashboard']);
          } else if (this.authService.isTechnician()) {
            this.router.navigate(['/assigned-tickets']);
          } else {
            this.router.navigate(['/tickets']);
          }
        },
        error: (error: any) => {
          this.loading = false;
          this.toastr.error('Email ou mot de passe incorrect', 'Erreur de connexion');
          console.error('Login error:', error);
        }
      });
    }
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (field === 'email' && control?.hasError('email')) {
      return 'Email invalide';
    }
    if (field === 'password' && control?.hasError('minlength')) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return '';
  }
}
