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
import { configureTestSuite } from 'ng-bullet';
import { MockComponent } from 'ng-mocks';

import { ContainerStatusComponent } from './container-status.component';
import { DonutChartComponent } from '@app/components/donut-chart/donut-chart.component';
import { MatCardModule } from '@angular/material/card';

describe('ContainerStatusComponent', () => {
  let component: ContainerStatusComponent;
  let fixture: ComponentFixture<ContainerStatusComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ContainerStatusComponent, MockComponent(DonutChartComponent)],
      imports: [MatCardModule],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
