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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { configureTestSuite } from 'ng-bullet';
import { MatCardModule } from '@angular/material/card';
import { NgxSpinnerService } from 'ngx-spinner';
import { MockComponent } from 'ng-mocks';

import { DashboardComponent } from './dashboard.component';
import { AppStatusComponent } from '@app/components/app-status/app-status.component';
import { AppHistoryComponent } from '@app/components/app-history/app-history.component';
import { ContainerStatusComponent } from '@app/components/container-status/container-status.component';
import { ContainerHistoryComponent } from '@app/components/container-history/container-history.component';
import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { EventBusService } from '@app/services/event-bus/event-bus.service';
import {
  MockSchedulerService,
  MockNgxSpinnerService,
  MockEventBusService,
} from '@app/testing/mocks';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        DashboardComponent,
        MockComponent(AppStatusComponent),
        MockComponent(AppHistoryComponent),
        MockComponent(ContainerStatusComponent),
        MockComponent(ContainerHistoryComponent),
      ],
      imports: [MatCardModule, RouterTestingModule],
      providers: [
        { provide: SchedulerService, useValue: MockSchedulerService },
        { provide: NgxSpinnerService, useValue: MockNgxSpinnerService },
        { provide: EventBusService, useValue: MockEventBusService },
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
