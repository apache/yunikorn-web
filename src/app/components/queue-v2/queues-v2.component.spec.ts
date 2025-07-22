/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { QueueV2Component } from './queues-v2.component';
import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

// Mock services
class MockSchedulerService {
  fetchSchedulerQueues(partitionName: string) {
    return of({
      rootQueue: { name: 'root', children: [{ name: 'child1' }] },
    });
  }
}

class MockNgxSpinnerService {
  show() {}
  hide() {}
}

describe('QueueV2Component', () => {
  let component: QueueV2Component;
  let fixture: ComponentFixture<QueueV2Component>;
  let schedulerService: SchedulerService;
  let spinnerService: NgxSpinnerService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [QueueV2Component],
      providers: [
        { provide: SchedulerService, useClass: MockSchedulerService },
        { provide: NgxSpinnerService, useClass: MockNgxSpinnerService },
      ],
      imports: [RouterTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueueV2Component);
    component = fixture.componentInstance;
    schedulerService = TestBed.inject(SchedulerService);
    spinnerService = TestBed.inject(NgxSpinnerService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fetchSchedulerQueuesForPartition', () => {
    it('should call SchedulerService and NgxSpinnerService methods', () => {
      const schedulerSpy = spyOn(schedulerService, 'fetchSchedulerQueues').and.callThrough();
      const spinnerShowSpy = spyOn(spinnerService, 'show').and.callThrough();
      const spinnerHideSpy = spyOn(spinnerService, 'hide').and.callThrough();

      component.fetchSchedulerQueuesForPartition();

      expect(schedulerSpy).toHaveBeenCalledWith('default');
      expect(spinnerShowSpy).toHaveBeenCalledBefore(schedulerSpy);
      expect(spinnerHideSpy).toHaveBeenCalled();
      expect(component.rootQueue).toBeTruthy();
    });
  });
});
