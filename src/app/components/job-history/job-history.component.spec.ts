import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material';
import { configureTestSuite } from 'ng-bullet';
import { MockComponent } from 'ng-mocks';

import { JobHistoryComponent } from './job-history.component';
import { AreaChartComponent } from '@app/components/area-chart/area-chart.component';

describe('JobHistoryComponent', () => {
  let component: JobHistoryComponent;
  let fixture: ComponentFixture<JobHistoryComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [JobHistoryComponent, MockComponent(AreaChartComponent)],
      imports: [MatCardModule]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
