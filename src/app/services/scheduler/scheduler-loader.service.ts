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

import { Injectable, Injector } from '@angular/core';
import { LoadRemoteModuleEsmOptions } from '@angular-architects/module-federation';
import { SchedulerService } from './scheduler.service';
import { ModuleFederationWrapper } from '@app/utils/moduleFederationWrapper';

@Injectable({
  providedIn: 'root',
})
export class SchedulerServiceLoader {
  constructor(private injector: Injector) {}

  async initializeSchedulerService(
    remoteComponentConfig: LoadRemoteModuleEsmOptions | null
  ): Promise<SchedulerService | null> {
    if (remoteComponentConfig !== null) {
      try {
        const remoteModule = await ModuleFederationWrapper.loadRemoteModule(remoteComponentConfig);
        if (remoteModule && remoteModule.SchedulerService) {
          return this.injector.get(remoteModule.SchedulerService);
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    }
    return null;
  }
}
