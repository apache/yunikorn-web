import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { MatCardModule } from '@angular/material';
import { MockComponent } from 'ng-mocks';

import { ContainerHistoryComponent } from './container-history.component';
import { AreaChartComponent } from '@app/components/area-chart/area-chart.component';

describe('ContainerHistoryComponent', () => {
  let component: ContainerHistoryComponent;
  let fixture: ComponentFixture<ContainerHistoryComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ContainerHistoryComponent, MockComponent(AreaChartComponent)],
      imports: [MatCardModule]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
