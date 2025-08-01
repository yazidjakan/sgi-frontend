import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentCreateComponent } from './incident-create.component';

describe('IncidentCreateComponent', () => {
  let component: IncidentCreateComponent;
  let fixture: ComponentFixture<IncidentCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IncidentCreateComponent]
    });
    fixture = TestBed.createComponent(IncidentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
