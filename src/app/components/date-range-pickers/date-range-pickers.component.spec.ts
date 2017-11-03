import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateRangePickersComponent } from './date-range-pickers.component';

describe('DateRangePickersComponent', () => {
  let component: DateRangePickersComponent;
  let fixture: ComponentFixture<DateRangePickersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateRangePickersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateRangePickersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
