import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss']
})
export class SystemComponent {
  form: FormGroup;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      theme: ['clair'],
      language: ['fr'],
      notifications: [true]
    });
  }

  save(): void {
    // TODO: persister via service/config
    console.log('Saved settings', this.form.value);
  }
}


