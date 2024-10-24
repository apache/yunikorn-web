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

import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import * as mf from '@angular-architects/module-federation';
import { LoadRemoteModuleEsmOptions } from '@angular-architects/module-federation';
import { SchedulerServiceLoader } from './scheduler-loader.service';
import { MockEnvconfigService, MockModuleFederationService } from '@app/testing/mocks';
import { EnvconfigService } from '@app/services/envconfig/envconfig.service';
import { ModuleFederationWrapper } from '@app/utils/moduleFederationWrapper';

describe('SchedulerServiceLoader', () => {
  let serviceLoader: SchedulerServiceLoader;
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SchedulerServiceLoader,
        { provide: EnvconfigService, useValue: MockEnvconfigService },
        { provide: mf, useValue: MockModuleFederationService },
      ],
    });
    serviceLoader = TestBed.inject(SchedulerServiceLoader);
    injector = TestBed.inject(Injector);
  });

  it('should be created', () => {
    expect(serviceLoader).toBeTruthy();
  });

  it('should return null if remoteComponentConfig is null', async () => {
    const result = await serviceLoader.initializeSchedulerService(null);
    expect(result).toBeNull();
  });

  it('should load remote module and return SchedulerService instance', async () => {
    const loadRemoteModuleOptions: LoadRemoteModuleEsmOptions = {
      type: 'module',
      remoteEntry: 'http://localhost/remoteEntry.js',
      exposedModule: './Module',
    };

    const fakeModule: any = {};
    const remoteModule: any = {
      NewsModule: fakeModule,
    };

    const mockLoadRemoteModule = spyOn(ModuleFederationWrapper, 'loadRemoteModule');

    mockLoadRemoteModule
      .withArgs(loadRemoteModuleOptions)
      .and.returnValue(Promise.resolve(remoteModule));

    const result = await mockLoadRemoteModule(loadRemoteModuleOptions);

    expect(mockLoadRemoteModule).toHaveBeenCalledOnceWith(loadRemoteModuleOptions);
    expect(result).toEqual(remoteModule);
  });

  it('should return null and log error if SchedulerService is not found in remote module', async () => {
    spyOn(console, 'error');
    spyOn(ModuleFederationWrapper, 'loadRemoteModule').and.returnValue(Promise.resolve({}));

    const remoteComponentConfig = {
      type: 'module',
      remoteEntry: 'http://localhost/remoteEntry.js',
      exposedModule: './Module',
    } as LoadRemoteModuleEsmOptions;
    const result = await serviceLoader.initializeSchedulerService(remoteComponentConfig);

    expect(ModuleFederationWrapper.loadRemoteModule).toHaveBeenCalledWith(remoteComponentConfig);
    expect(console.error).toHaveBeenCalledWith('SchedulerService not found.');
    expect(result).toBeNull();
  });

  it('should return null and log error if loading remote module fails', async () => {
    spyOn(console, 'error');
    spyOn(ModuleFederationWrapper, 'loadRemoteModule').and.returnValue(
      Promise.reject(new Error('Loading error'))
    );

    const remoteComponentConfig = {
      type: 'module',
      remoteEntry: 'http://localhost/remoteEntry.js',
      exposedModule: './Module',
    } as LoadRemoteModuleEsmOptions;

    const result = await serviceLoader.initializeSchedulerService(remoteComponentConfig);

    expect(ModuleFederationWrapper.loadRemoteModule).toHaveBeenCalledWith(remoteComponentConfig);
    expect(console.error).toHaveBeenCalledWith(
      'Error loading the remote module:',
      new Error('Loading error')
    );
    expect(result).toBeNull();
  });
});
