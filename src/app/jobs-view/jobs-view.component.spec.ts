import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsViewComponent } from './jobs-view.component';

describe('JobsViewComponent', () => {
  let component: JobsViewComponent;
  let fixture: ComponentFixture<JobsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
