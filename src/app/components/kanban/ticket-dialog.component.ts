import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IncidentService } from '../../services/incident.service';
import { NiveauPriorite, StatutIncident, Incident } from '../../models/incident.model';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ticket-dialog',
  templateUrl: './ticket-dialog.component.html',
  styleUrls: ['./ticket-dialog.component.scss']
})
export class TicketDialogComponent implements OnInit {
  form!: FormGroup;
  priorities = [
    { value: NiveauPriorite.CRITIQUE, label: 'Critique' },
    { value: NiveauPriorite.ELEVEE, label: 'Élevée' },
    { value: NiveauPriorite.MOYENNE, label: 'Moyenne' },
    { value: NiveauPriorite.FAIBLE, label: 'Faible' }
  ];
  users: User[] = [];
  isSubmitting = false;

  constructor(
    private dialogRef: MatDialogRef<TicketDialogComponent>,
    private fb: FormBuilder,
    private incidentService: IncidentService,
    private userService: UserService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: { defaultStatus?: StatutIncident }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: [NiveauPriorite.MOYENNE, Validators.required],
      assigneeId: [null]
    });

    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const reporterId = this.authService.currentUserValue?.id as number;
    const payload: Incident = {
      title: this.form.value.title,
      description: this.form.value.description || undefined,
      priority: this.form.value.priority,
      incidentType: 'Général',
      reporterId,
      assignedTechnicianId: this.form.value.assigneeId || undefined,
      status: this.data?.defaultStatus ?? StatutIncident.BACKLOG
    } as Incident;

    this.incidentService.createIncident(payload).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.dialogRef.close(created);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

