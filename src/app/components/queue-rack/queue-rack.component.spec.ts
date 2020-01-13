import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule, MatProgressBarModule } from '@angular/material';
import { configureTestSuite } from 'ng-bullet';

import { QueueRackComponent } from './queue-rack.component';

describe('QueueRackComponent', () => {
  let component: QueueRackComponent;
  let fixture: ComponentFixture<QueueRackComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [QueueRackComponent],
      imports: [MatCardModule, MatProgressBarModule]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueueRackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
