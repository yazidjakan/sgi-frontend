import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss']
})
export class SystemComponent implements OnInit {
  form: FormGroup;
  lastSaved: Date | null = null;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      // General Preferences
      theme: ['clair'],
      language: ['fr'],
      
      // Notifications
      notifications: [true]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    // Load saved settings from localStorage or service
    const savedSettings = localStorage.getItem('sgi-system-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        this.form.patchValue(settings);
        
        // Set lastSaved if settings exist
        const lastSavedStr = localStorage.getItem('sgi-system-settings-timestamp');
        if (lastSavedStr) {
          this.lastSaved = new Date(lastSavedStr);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }

  save(): void {
    if (this.form.valid) {
      try {
        // Save to localStorage (in real app, would be a service call)
        const settings = this.form.value;
        localStorage.setItem('sgi-system-settings', JSON.stringify(settings));
        localStorage.setItem('sgi-system-settings-timestamp', new Date().toISOString());
        
        this.lastSaved = new Date();
        
        // Show success notification
        this.snackBar.open('Configuration sauvegardée avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });

        // Apply theme changes immediately
        this.applyThemeChange(settings.theme);
        
        console.log('Settings saved:', settings);
      } catch (error) {
        console.error('Error saving settings:', error);
        this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    }
  }

  private applyThemeChange(theme: string): void {
    // Apply theme to document body
    document.body.classList.remove('light-theme', 'dark-theme');
    
    if (theme === 'sombre') {
      document.body.classList.add('dark-theme');
    } else if (theme === 'clair') {
      document.body.classList.add('light-theme');
    } else if (theme === 'auto') {
      // Auto theme based on system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    }
  }


}