import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { configureTestSuite } from 'ng-bullet';

import { SchedulerService } from './scheduler.service';
import { EnvconfigService } from '@app/services/envconfig/envconfig.service';
import { MockEnvconfigService } from '@app/testing/mocks';

describe('SchedulerService', () => {
  let service: SchedulerService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SchedulerService, { provide: EnvconfigService, useValue: MockEnvconfigService }]
    });
  });

  beforeEach(() => {
    service = TestBed.get(SchedulerService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });
});
