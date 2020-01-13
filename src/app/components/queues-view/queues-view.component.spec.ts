import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'ng-bullet';
import { MockComponent } from 'ng-mocks';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDividerModule, MatSelectModule, MatSidenavModule } from '@angular/material';

import { QueuesViewComponent } from './queues-view.component';
import { QueueRackComponent } from '@app/components/queue-rack/queue-rack.component';
import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { MockSchedulerService, MockNgxSpinnerService } from '@app/testing/mocks';

describe('QueuesViewComponent', () => {
  let component: QueuesViewComponent;
  let fixture: ComponentFixture<QueuesViewComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [QueuesViewComponent, MockComponent(QueueRackComponent)],
      imports: [NoopAnimationsModule, MatDividerModule, MatSelectModule, MatSidenavModule],
      providers: [
        { provide: SchedulerService, useValue: MockSchedulerService },
        { provide: NgxSpinnerService, useValue: MockNgxSpinnerService }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueuesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
