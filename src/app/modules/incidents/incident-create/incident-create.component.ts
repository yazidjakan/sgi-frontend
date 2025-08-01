import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { IncidentService } from '../../../services/incident.service';

export interface IncidentCreate {
  title: string;
  description: string;
  type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Incident extends IncidentCreate {
  id: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
  reporterId?: number;
  assigneeId?: number;
}
@Component({
  selector: 'app-incident-create',
  templateUrl: './incident-create.component.html',
  styleUrls: ['./incident-create.component.scss']
})
export class IncidentCreateComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  incidentForm: FormGroup;
  selectedFiles: File[] = [];
  isLoading: boolean = false;
  incidentTypes: string[] = [
    'Problème réseau',
    'Bogue logiciel',
    'Problème matériel',
    'Demande d\'assistance',
    'Autre'
  ];

  constructor(
    private fb: FormBuilder,
    private incidentService: IncidentService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.incidentForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.required],
      type: ['', Validators.required],
      priority: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  onSubmit(): void {
    if (this.incidentForm.invalid) {
      return;
    }

    this.isLoading = true;

    const formData = new FormData();

    // Append all form values
    Object.keys(this.incidentForm.value).forEach(key => {
      formData.append(key, this.incidentForm.value[key]);
    });

    // Append files if any
    this.selectedFiles.forEach(file => {
      formData.append('attachments', file, file.name);
    });

    // Use the new service method
    this.incidentService.createIncidentWithAttachments(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Ticket créé avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/incidents']);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(
          err.error?.message || 'Erreur lors de la création du ticket',
          'Fermer',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }
}
