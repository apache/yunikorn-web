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
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerService } from 'ngx-spinner';

import { MockNgxSpinnerService } from '@app/testing/mocks';
import { AllocationInfo } from '@app/models/alloc-info.model';

import { AllocationsDrawerComponent } from './allocations-drawer.component';

describe('AllocationsDrawerComponent', () => {
  let component: AllocationsDrawerComponent;
  let fixture: ComponentFixture<AllocationsDrawerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllocationsDrawerComponent],
      imports: [
        NoopAnimationsModule,
        MatSidenavModule,
        MatPaginatorModule,
        MatDividerModule,
        MatSortModule,
        MatInputModule,
        MatTableModule,
        MatSelectModule,
      ],
      providers: [{ provide: NgxSpinnerService, useValue: MockNgxSpinnerService }],
    }).compileComponents();
    fixture = TestBed.createComponent(AllocationsDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open drawer', () => {
    spyOn(component.matDrawer, 'open');
    component.openDrawer();
    expect(component.matDrawer.open).toHaveBeenCalled();
  });

  it('should close drawer', () => {
    spyOn(component.matDrawer, 'close');
    component.closeDrawer();
    expect(component.matDrawer.close).toHaveBeenCalled();
  });

  it('should copy the allocations URL to clipboard', () => {
    const debugEl: DebugElement = fixture.debugElement;
    const copyButton = debugEl.query(By.css('.copy-btn'));
    const copyButtonSpy = spyOn(component, 'copyLinkToClipboard');
    copyButton.triggerEventHandler('click', null);
    expect(copyButtonSpy).toHaveBeenCalled();
  });

  it('should toggle allocations detail with nothing previously selected', () => {
    const row = 0;
    const allocDataSource = new MatTableDataSource([{ expanded: false }]);
    component.allocDataSource = allocDataSource as unknown as MatTableDataSource<
      AllocationInfo & { expanded: boolean }
    >;

    component.allocationsDetailToggle(row);
    expect(component.allocDataSource.data[row].expanded).toBe(true);

    component.allocationsDetailToggle(row);
    expect(component.allocDataSource.data[row].expanded).toBe(false);
  });

  it('should toggle allocations detail with previous selection active', () => {
    const row = 0;
    const allocDataSource = new MatTableDataSource([{ expanded: false }, { expanded: true }]);
    component.selectedAllocationsRow = 1;
    component.allocDataSource = allocDataSource as unknown as MatTableDataSource<
      AllocationInfo & { expanded: boolean }
    >;

    component.allocationsDetailToggle(row);
    expect(component.allocDataSource.data[row].expanded).toBe(true);

    component.allocationsDetailToggle(row);
    expect(component.allocDataSource.data[row].expanded).toBe(false);
  });
});
