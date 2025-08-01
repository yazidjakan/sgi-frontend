import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlaDashboardComponent } from './sla-dashboard.component';

describe('SlaDashboardComponent', () => {
  let component: SlaDashboardComponent;
  let fixture: ComponentFixture<SlaDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SlaDashboardComponent]
    });
    fixture = TestBed.createComponent(SlaDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
