import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { configureTestSuite } from 'ng-bullet';

import { PrometheusService } from './prometheus.service';

describe('PrometheusService', () => {
  let service: PrometheusService;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PrometheusService]
    });
  });

  beforeEach(() => {
    service = TestBed.get(PrometheusService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });
});
