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
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { configureTestSuite } from 'ng-bullet';
import { MockComponent } from 'ng-mocks';
import { NgxSpinnerService } from 'ngx-spinner';

import { ClusterInfoComponent } from './cluster-info.component';
import { JobStatusComponent } from '@app/components/job-status/job-status.component';
import { JobHistoryComponent } from '@app/components/job-history/job-history.component';
import { ContainerStatusComponent } from '@app/components/container-status/container-status.component';
import { ContainerHistoryComponent } from '@app/components/container-history/container-history.component';
import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import {
  MockSchedulerService,
  MockNgxSpinnerService,
  MockActivatedRoute
} from '@app/testing/mocks';

describe('ClusterInfoComponent', () => {
  let component: ClusterInfoComponent;
  let fixture: ComponentFixture<ClusterInfoComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [
        ClusterInfoComponent,
        MockComponent(JobStatusComponent),
        MockComponent(JobHistoryComponent),
        MockComponent(ContainerStatusComponent),
        MockComponent(ContainerHistoryComponent)
      ],
      imports: [RouterTestingModule],
      providers: [
        { provide: SchedulerService, useValue: MockSchedulerService },
        { provide: NgxSpinnerService, useValue: MockNgxSpinnerService },
        { provide: ActivatedRoute, useValue: MockActivatedRoute }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
