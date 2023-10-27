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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatCardModule} from '@angular/material/card';
import {AreaChartComponent} from '@app/components/area-chart/area-chart.component';
import {configureTestSuite} from 'ng-bullet';
import {MockComponent} from 'ng-mocks';

import {ContainerHistoryComponent} from './container-history.component';

describe('ContainerHistoryComponent', () => {
  let component: ContainerHistoryComponent;
  let fixture: ComponentFixture<ContainerHistoryComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ContainerHistoryComponent, MockComponent(AreaChartComponent)],
      imports: [MatCardModule],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
