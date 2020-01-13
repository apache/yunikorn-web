import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { MockComponent } from 'ng-mocks';

import { ContainerStatusComponent } from './container-status.component';
import { DonutChartComponent } from '@app/components/donut-chart/donut-chart.component';
import { MatCardModule } from '@angular/material';

describe('ContainerStatusComponent', () => {
  let component: ContainerStatusComponent;
  let fixture: ComponentFixture<ContainerStatusComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ContainerStatusComponent, MockComponent(DonutChartComponent)],
      imports: [MatCardModule]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
