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

import { NgModule, APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { AppRoutingModule } from './app-routing.module';
import { envConfigFactory, EnvconfigService } from './services/envconfig/envconfig.service';
import { ApiErrorInterceptor } from './interceptors/api-error/api-error.interceptor';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { QueuesViewComponent } from './components/queues-view/queues-view.component';
import { DonutChartComponent } from './components/donut-chart/donut-chart.component';
import { AreaChartComponent } from './components/area-chart/area-chart.component';
import { AppStatusComponent } from './components/app-status/app-status.component';
import { AppHistoryComponent } from './components/app-history/app-history.component';
import { ContainerStatusComponent } from './components/container-status/container-status.component';
import { ContainerHistoryComponent } from './components/container-history/container-history.component';
import { QueueRackComponent } from './components/queue-rack/queue-rack.component';
import { AppsViewComponent } from './components/apps-view/apps-view.component';
import { NodesViewComponent } from './components/nodes-view/nodes-view.component';
import { ErrorViewComponent } from './components/error-view/error-view.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    QueuesViewComponent,
    DonutChartComponent,
    AreaChartComponent,
    AppStatusComponent,
    AppHistoryComponent,
    ContainerStatusComponent,
    ContainerHistoryComponent,
    QueueRackComponent,
    AppsViewComponent,
    NodesViewComponent,
    ErrorViewComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxSpinnerModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatSelectModule,
    MatDividerModule,
    MatListModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatTooltipModule,
    MatMenuModule,
    MatButtonModule,
    AppRoutingModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: envConfigFactory,
      deps: [EnvconfigService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiErrorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
