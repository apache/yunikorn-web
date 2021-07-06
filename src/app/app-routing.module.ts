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

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { QueuesViewComponent } from './components/queues-view/queues-view.component';
import { AppsViewComponent } from './components/apps-view/apps-view.component';
import { NodesViewComponent } from './components/nodes-view/nodes-view.component';
import { ErrorViewComponent } from './components/error-view/error-view.component';

const appRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: { breadcrumb: 'Dashboard' },
  },
  {
    path: 'applications',
    component: AppsViewComponent,
    data: { breadcrumb: 'Applications' },
  },
  {
    path: 'queues',
    component: QueuesViewComponent,
    data: { breadcrumb: 'Queues' },
  },
  {
    path: 'nodes',
    component: NodesViewComponent,
    data: { breadcrumb: 'Nodes' },
  },
  {
    path: 'error',
    component: ErrorViewComponent,
    data: { breadcrumb: 'Error' },
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
