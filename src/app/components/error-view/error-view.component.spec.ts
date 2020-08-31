import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { MatCardModule } from '@angular/material';

import { ErrorViewComponent } from './error-view.component';

describe('ErrorViewComponent', () => {
  let component: ErrorViewComponent;
  let fixture: ComponentFixture<ErrorViewComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [MatCardModule],
      declarations: [ErrorViewComponent]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
