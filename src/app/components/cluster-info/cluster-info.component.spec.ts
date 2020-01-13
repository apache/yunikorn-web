import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';
import { MockComponent } from 'ng-mocks';
import { NgxSpinnerService } from 'ngx-spinner';

import { ClusterInfoComponent } from './cluster-info.component';
import { JobStatusComponent } from '@app/components/job-status/job-status.component';
import { JobHistoryComponent } from '@app/components/job-history/job-history.component';
import { ContainerStatusComponent } from '@app/components/container-status/container-status.component';
import { ContainerHistoryComponent } from '@app/components/container-history/container-history.component';
import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import {
  MockSchedulerService,
  MockNgxSpinnerService,
  MockActivatedRoute
} from '@app/testing/mocks';

describe('ClusterInfoComponent', () => {
  let component: ClusterInfoComponent;
  let fixture: ComponentFixture<ClusterInfoComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ClusterInfoComponent,
        MockComponent(JobStatusComponent),
        MockComponent(JobHistoryComponent),
        MockComponent(ContainerStatusComponent),
        MockComponent(ContainerHistoryComponent)
      ],
      imports: [RouterTestingModule],
      providers: [
        { provide: SchedulerService, useValue: MockSchedulerService },
        { provide: NgxSpinnerService, useValue: MockNgxSpinnerService },
        { provide: ActivatedRoute, useValue: MockActivatedRoute }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
