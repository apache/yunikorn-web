import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material';
import { configureTestSuite } from 'ng-bullet';
import { MockComponent } from 'ng-mocks';

import { JobStatusComponent } from './job-status.component';
import { DonutChartComponent } from '@app/components/donut-chart/donut-chart.component';

describe('JobStatusComponent', () => {
  let component: JobStatusComponent;
  let fixture: ComponentFixture<JobStatusComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [JobStatusComponent, MockComponent(DonutChartComponent)],
      imports: [MatCardModule]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
