import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthchecksComponent } from './healthchecks.component';

describe('HealthchecksComponent', () => {
  let component: HealthchecksComponent;
  let fixture: ComponentFixture<HealthchecksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HealthchecksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthchecksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
