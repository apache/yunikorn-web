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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

import { AppRoutingModule } from '@app/app-routing.module';
import { envConfigFactory, EnvconfigService } from '@app/services/envconfig/envconfig.service';
import { ApiErrorInterceptor } from '@app/interceptors/api-error/api-error.interceptor';
import { AppComponent } from '@app/app.component';
import { DashboardComponent } from '@app/components/dashboard/dashboard.component';
import { QueuesViewComponent } from '@app/components/queues-view/queues-view.component';
import { DonutChartComponent } from '@app/components/donut-chart/donut-chart.component';
import { AreaChartComponent } from '@app/components/area-chart/area-chart.component';
import { AppStatusComponent } from '@app/components/app-status/app-status.component';
import { AppHistoryComponent } from '@app/components/app-history/app-history.component';
import { ContainerStatusComponent } from '@app/components/container-status/container-status.component';
import { ContainerHistoryComponent } from '@app/components/container-history/container-history.component';
import { QueueRackComponent } from '@app/components/queue-rack/queue-rack.component';
import { AppsViewComponent } from '@app/components/apps-view/apps-view.component';
import { NodesViewComponent } from '@app/components/nodes-view/nodes-view.component';
import { HighlightSearchPipe } from '@app/components/nodes-view/highlighttable-search.pipe';
import { ErrorViewComponent } from '@app/components/error-view/error-view.component';
import { StatusViewComponent } from '@app/components/status-view/status-view.component';
import { HealthchecksComponent } from '@app/components/healthchecks/healthchecks.component';
import { AppNodeUtilizationsComponent } from '@app/components/app-node-utilizations/app-node-utilizations.component';
import { VerticalBarChartComponent } from '@app/components/vertical-bar-chart/vertical-bar-chart.component';
import { LicensesModalComponent } from '@app/components/licenses-modal/licenses-modal.component';
import { CardComponent } from './components/card/card.component';
import { QueueMenuTreeComponent } from './components/queue-menu-tree/queue-menu-tree.component';
import { MatTreeModule } from '@angular/material/tree';
import { AngularSplitModule } from 'angular-split';
import { SearchInputComponent } from './components/search-input/search-input.component';

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
    HighlightSearchPipe,
    ErrorViewComponent,
    StatusViewComponent,
    HealthchecksComponent,
    AppNodeUtilizationsComponent,
    VerticalBarChartComponent,
    LicensesModalComponent,
    CardComponent,
    QueueMenuTreeComponent,
    SearchInputComponent
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
    MatExpansionModule,
    MatIconModule,
    MatDialogModule,
    MatTreeModule,
    AngularSplitModule,
    ReactiveFormsModule
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
