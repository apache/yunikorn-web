import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { configureTestSuite } from 'ng-bullet';

import { EnvconfigService } from './envconfig.service';

describe('EnvconfigService', () => {
  let service: EnvconfigService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EnvconfigService]
    });
  });

  beforeEach(() => {
    service = TestBed.get(EnvconfigService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });
});
