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
import {MatExpansionModule} from "@angular/material/expansion";
import {MatIconModule} from "@angular/material/icon";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {RouterTestingModule} from "@angular/router/testing";

import {HealthchecksComponent} from './healthchecks.component';

describe('HealthchecksComponent', () => {
  let component: HealthchecksComponent;
  let fixture: ComponentFixture<HealthchecksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
        declarations: [ HealthchecksComponent ],
        imports: [
            NoopAnimationsModule,
            RouterTestingModule,
            MatIconModule,
            MatExpansionModule,
        ],
    })
    .compileComponents();
    fixture = TestBed.createComponent(HealthchecksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
