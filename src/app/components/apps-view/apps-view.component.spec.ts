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
import { HAMMER_LOADER } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { configureTestSuite } from 'ng-bullet';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

import { AppsViewComponent } from './apps-view.component';
import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { MockSchedulerService, MockNgxSpinnerService } from '@app/testing/mocks';

describe('AppsViewComponent', () => {
  let component: AppsViewComponent;
  let fixture: ComponentFixture<AppsViewComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [AppsViewComponent],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatDividerModule,
        MatSortModule,
        MatInputModule,
        MatTooltipModule,
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
    fixture = TestBed.createComponent(AppsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
