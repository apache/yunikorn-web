import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { configureTestSuite } from 'ng-bullet';
import { MatCardModule } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';

import { DashboardComponent } from './dashboard.component';
import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { MockSchedulerService, MockNgxSpinnerService } from '@app/testing/mocks';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [MatCardModule, RouterTestingModule],
      providers: [
        { provide: SchedulerService, useValue: MockSchedulerService },
        { provide: NgxSpinnerService, useValue: MockNgxSpinnerService }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
