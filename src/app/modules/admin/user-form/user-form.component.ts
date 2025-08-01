import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'USER';
  createdAt?: Date;
  updatedAt?: Date;
}
@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent {
  userForm: FormGroup;
  isEditMode: boolean = false;
  roles = ['ADMIN', 'MANAGER', 'TECHNICIAN', 'USER'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {
    this.isEditMode = !!data;

    this.userForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      email: [data?.email || '', [Validators.required, Validators.email]],
      role: [data?.role || 'USER', Validators.required],
      password: ['', this.isEditMode ? null : Validators.required]
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;

      const operation = this.isEditMode
        ? this.userService.updateUser(this.data.id, userData)
        : this.userService.createUser(userData);

      operation.subscribe({
        next: (user) => this.dialogRef.close(user),
        error: (err) => console.error('Erreur:', err)
      });
    }
  }
}
