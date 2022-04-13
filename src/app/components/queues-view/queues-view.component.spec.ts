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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { configureTestSuite } from 'ng-bullet';
import { MockComponent } from 'ng-mocks';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';

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
      imports: [
        NoopAnimationsModule,
        RouterTestingModule,
        MatDividerModule,
        MatSelectModule,
        MatSidenavModule,
      ],
      providers: [
        { provide: SchedulerService, useValue: MockSchedulerService },
        { provide: NgxSpinnerService, useValue: MockNgxSpinnerService },
      ],
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
