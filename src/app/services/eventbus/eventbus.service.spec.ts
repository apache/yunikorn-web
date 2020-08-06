import { TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { EventbusService } from './eventbus.service';

describe('EventbusService', () => {
  let service: EventbusService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [EventbusService]
    });
  });

  beforeEach(() => {
    service = TestBed.get(EventbusService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });
});
