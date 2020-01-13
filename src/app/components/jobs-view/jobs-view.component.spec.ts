import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HAMMER_LOADER } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { configureTestSuite } from 'ng-bullet';
import {
  MatTableModule,
  MatPaginatorModule,
  MatDividerModule,
  MatSortModule
} from '@angular/material';

import { JobsViewComponent } from './jobs-view.component';
import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { MockSchedulerService, MockNgxSpinnerService } from '@app/testing/mocks';

describe('JobsViewComponent', () => {
  let component: JobsViewComponent;
  let fixture: ComponentFixture<JobsViewComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [JobsViewComponent],
      imports: [
        NoopAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatDividerModule,
        MatSortModule
      ],
      providers: [
        { provide: SchedulerService, useValue: MockSchedulerService },
        { provide: NgxSpinnerService, useValue: MockNgxSpinnerService },
        { provide: HAMMER_LOADER, useValue: () => new Promise(() => {}) }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
