import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirm = true;
  @Output() back = new EventEmitter<void>();
  @Input() embedded = false;
  showLogin = false;


  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        role: ['ROLE_USER', [Validators.required]],
        acceptTerms: [false, [Validators.requiredTrue]],
      },
      { validators: [this.passwordsMatchValidator] }
    );
  }

  ngOnInit(): void {
    document.documentElement.classList.add('auth-no-scroll');
    document.body.classList.add('auth-no-scroll');
  }

  ngOnDestroy(): void {
    document.documentElement.classList.remove('auth-no-scroll');
    document.body.classList.remove('auth-no-scroll');
  }

  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    return p && c && p !== c ? { passwordMismatch: true } : null;
  }

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const username = this.f['username'].value;
    const email = this.f['email'].value;
    const password = this.f['password'].value;
    const role = this.f['role'].value;

    this.auth.register(username, email, password, role).subscribe({
      next: (msg: string) => {
        this.loading = false;
        this.snackBar.open(msg || 'Compte créé avec succès. Connectez‑vous.', 'OK', { duration: 3000 });
        this.router.navigate(['/login'], { queryParams: { new: '1' } });
      },
      error: (err) => {
        this.loading = false;
        const message = err?.error?.message || 'Échec de la création du compte';
        this.snackBar.open(message, 'Fermer', { duration: 3000 });
      }
    });
  }
 

  openLogin(): void {
    this.back.emit();
  }
}