import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    document.documentElement.classList.add('auth-no-scroll');
    document.body.classList.add('auth-no-scroll');
  }

  ngOnDestroy(): void {
    document.documentElement.classList.remove('auth-no-scroll');
    document.body.classList.remove('auth-no-scroll');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    const { username, password } = this.loginForm.value;

    this.auth.login(username, password).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Connexion réussie', 'OK', { duration: 2500 });

        if (this.returnUrl && this.returnUrl !== '/login') {
          this.router.navigateByUrl(this.returnUrl);
          return;
        }
        if (this.auth.isAdmin()) this.router.navigate(['/users']);
        else if (this.auth.isManager()) this.router.navigate(['/dashboard']);
        else if (this.auth.isTechnician()) this.router.navigate(['/assigned-tickets']);
        else this.router.navigate(['/tickets']);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Nom d’utilisateur ou mot de passe incorrect', 'Fermer', { duration: 3000 });
      }
    });
  }

  getErrorMessage(field: string): string {
    const c = this.loginForm.get(field);
    if (c?.hasError('required')) return field === 'username' ? 'Nom d’utilisateur requis' : 'Mot de passe requis';
    return '';
  }

  openRegister(): void {
    this.router.navigate(['/register']);
  }


}