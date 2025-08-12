import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { RoleDto, UserDto } from '../../models/auth.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  isLoading = false;
  displayedColumns: string[] = ['username', 'email', 'roles', 'actions'];
  dataSource = new MatTableDataSource<UserDto>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  form: FormGroup;
  roles: RoleDto[] = [
    { id: 1, nom: 'ROLE_USER' },
    { id: 2, nom: 'ROLE_TECHNICIAN' },
    { id: 3, nom: 'ROLE_MANAGER' },
    { id: 4, nom: 'ROLE_ADMIN' }
  ];
  editingUser: UserDto | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      roleDtos: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.auth.getUsers().subscribe({
      next: (users) => {
        this.dataSource = new MatTableDataSource<UserDto>(users as any);
        setTimeout(() => {
          if (this.paginator) this.dataSource.paginator = this.paginator;
          if (this.sort) this.dataSource.sort = this.sort;
        });
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Impossible de charger les utilisateurs');
        this.isLoading = false;
      }
    });
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  startCreate(): void {
    this.editingUser = null;
    this.form.reset({ username: '', email: '', password: '', roleDtos: [] });
  }

  startEdit(user: UserDto): void {
    this.editingUser = user;
    this.form.reset({
      username: user.username,
      email: user.email,
      password: '',
      roleDtos: user.roleDtos || []
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const payload = { ...this.form.value } as any;
    if (this.editingUser) {
      this.auth.updateUser(payload, this.editingUser.id!).subscribe({
        next: () => { this.toastr.success('Utilisateur mis à jour'); this.loadUsers(); },
        error: () => this.toastr.error('Échec de la mise à jour')
      });
    } else {
      this.auth.createUser(payload).subscribe({
        next: () => { this.toastr.success('Utilisateur créé'); this.loadUsers(); },
        error: () => this.toastr.error('Échec de la création')
      });
    }
  }

  delete(user: UserDto): void {
    if (!confirm(`Supprimer l'utilisateur ${user.username} ?`)) return;
    this.auth.deleteUser(user.id!).subscribe({
      next: () => { this.toastr.success('Utilisateur supprimé'); this.loadUsers(); },
      error: () => this.toastr.error('Échec de la suppression')
    });
  }
}


