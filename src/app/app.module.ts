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

import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import {
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
  MatTooltipModule
} from '@angular/material';

import { envConfigFactory, EnvconfigService } from './services/envconfig/envconfig.service';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClusterInfoComponent } from './components/cluster-info/cluster-info.component';
import { QueuesViewComponent } from './components/queues-view/queues-view.component';
import { ClusterContainerComponent } from './components/cluster-container/cluster-container.component';
import { DonutChartComponent } from './components/donut-chart/donut-chart.component';
import { AreaChartComponent } from './components/area-chart/area-chart.component';
import { AppStatusComponent } from './components/app-status/app-status.component';
import { AppHistoryComponent } from './components/app-history/app-history.component';
import { ContainerStatusComponent } from './components/container-status/container-status.component';
import { ContainerHistoryComponent } from './components/container-history/container-history.component';
import { QueueRackComponent } from './components/queue-rack/queue-rack.component';
import { AppsViewComponent } from './components/apps-view/apps-view.component';
import { NodesViewComponent } from './components/nodes-view/nodes-view.component';

const appRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: { breadcrumb: 'Dashboard' }
  },
  {
    path: 'clusters/:clusterName',
    component: ClusterContainerComponent,
    data: { breadcrumb: ':clusterName', prependRoot: true },
    children: [
      {
        path: 'info',
        component: ClusterInfoComponent,
        data: { breadcrumb: 'Info' }
      },
      {
        path: 'apps',
        component: AppsViewComponent,
        data: { breadcrumb: 'Applications' }
      },
      {
        path: 'queues',
        component: QueuesViewComponent,
        data: { breadcrumb: 'Queues' }
      },
      {
        path: 'nodes',
        component: NodesViewComponent,
        data: { breadcrumb: 'Nodes' }
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'info'
      }
    ]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ClusterInfoComponent,
    QueuesViewComponent,
    ClusterContainerComponent,
    DonutChartComponent,
    AreaChartComponent,
    AppStatusComponent,
    AppHistoryComponent,
    ContainerStatusComponent,
    ContainerHistoryComponent,
    QueueRackComponent,
    AppsViewComponent,
    NodesViewComponent
  ],
  imports: [
    BrowserModule,
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
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: envConfigFactory,
      deps: [EnvconfigService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
