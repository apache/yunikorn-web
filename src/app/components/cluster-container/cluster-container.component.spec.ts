import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatTabsModule } from '@angular/material';
import { configureTestSuite } from 'ng-bullet';

import { ClusterContainerComponent } from './cluster-container.component';

describe('ClusterContainerComponent', () => {
  let component: ClusterContainerComponent;
  let fixture: ComponentFixture<ClusterContainerComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ClusterContainerComponent],
      imports: [RouterTestingModule, MatTabsModule]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
