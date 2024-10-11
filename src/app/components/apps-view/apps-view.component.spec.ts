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

import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By, HAMMER_LOADER } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AppInfo } from '@app/models/app-info.model';
import { EnvconfigService } from '@app/services/envconfig/envconfig.service';
import { SchedulerService } from '@app/services/scheduler/scheduler.service';
import { MatChipsModule } from '@angular/material/chips';

import {
  MockEnvconfigService,
  MockNgxSpinnerService,
  MockSchedulerService,
} from '@app/testing/mocks';
import { NgxSpinnerService } from 'ngx-spinner';
import { of } from 'rxjs';

import { AppsViewComponent } from './apps-view.component';

describe('AppsViewComponent', () => {
  let component: AppsViewComponent;
  let fixture: ComponentFixture<AppsViewComponent>;

  beforeEach(() => {
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
        MatSidenavModule,
        MatChipsModule,
      ],
      providers: [
        { provide: SchedulerService, useValue: MockSchedulerService },
        { provide: NgxSpinnerService, useValue: MockNgxSpinnerService },
        { provide: HAMMER_LOADER, useValue: () => new Promise(() => {}) },
        { provide: EnvconfigService, useValue: MockEnvconfigService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AppsViewComponent);
    component = fixture.componentInstance;
    spyOn(component, 'initializeSidebarComponent').and.callFake(
      (b = null) => new Promise(() => {})
    );
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have usedResource and pendingResource column with detailToggle OFF', () => {
    let service: SchedulerService;
    service = TestBed.inject(SchedulerService);
    let appInfo = new AppInfo(
      'app1',
      'Memory: 500.0 KB, CPU: 10, pods: 1',
      'Memory: 0.0 bytes, CPU: 0, pods: n/a',
      '',
      1,
      2,
      [],
      2,
      'RUNNING',
      []
    );
    spyOn(service, 'fetchAppList').and.returnValue(of([appInfo]));
    component.fetchAppListForPartitionAndQueue('default', 'root');
    fixture.detectChanges();
    const debugEl: DebugElement = fixture.debugElement;
    expect(
      debugEl.query(By.css('[data-test="Memory: 500.0 KB,CPU: 10,pods: 1"]')).nativeElement
        .innerText
    ).toContain('Memory: 500.0 KB\nCPU: 10');
    expect(
      debugEl.query(By.css('[data-test="Memory: 0.0 bytes,CPU: 0,pods: n/a"]')).nativeElement
        .innerText
    ).toContain('Memory: 0.0 bytes\nCPU: 0');
  });

  it('should have usedResource and pendingResource column with detailToggle ON', () => {
    let service: SchedulerService;
    service = TestBed.inject(SchedulerService);
    let appInfo = new AppInfo(
      'app1',
      'Memory: 500.0 KB, CPU: 10, pods: 1',
      'Memory: 0.0 bytes, CPU: 0, pods: n/a',
      '',
      1,
      2,
      [],
      2,
      'RUNNING',
      []
    );
    spyOn(service, 'fetchAppList').and.returnValue(of([appInfo]));
    component.fetchAppListForPartitionAndQueue('default', 'root');
    component.detailToggle = true;
    fixture.detectChanges();
    const debugEl: DebugElement = fixture.debugElement;
    expect(
      debugEl.query(By.css('[data-test="Memory: 500.0 KB,CPU: 10,pods: 1"]')).nativeElement
        .innerText
    ).toContain('Memory: 500.0 KB\nCPU: 10\npods: 1');
    expect(
      debugEl.query(By.css('[data-test="Memory: 0.0 bytes,CPU: 0,pods: n/a"]')).nativeElement
        .innerText
    ).toContain('Memory: 0.0 bytes\nCPU: 0\npods: n/a');
  });
});
