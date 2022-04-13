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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerService } from 'ngx-spinner';
import { configureTestSuite } from 'ng-bullet';

import { NodesViewComponent } from './nodes-view.component';
import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { HAMMER_LOADER } from '@angular/platform-browser';
import { MockSchedulerService, MockNgxSpinnerService } from '@app/testing/mocks';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';

describe('NodesViewComponent', () => {
  let component: NodesViewComponent;
  let fixture: ComponentFixture<NodesViewComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [NodesViewComponent],
      imports: [
        NoopAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatDividerModule,
        MatSortModule,
        MatSelectModule,
      ],
      providers: [
        { provide: SchedulerService, useValue: MockSchedulerService },
        { provide: NgxSpinnerService, useValue: MockNgxSpinnerService },
        { provide: HAMMER_LOADER, useValue: () => new Promise(() => {}) },
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NodesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
