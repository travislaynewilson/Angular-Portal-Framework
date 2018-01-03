import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginatorsComponent } from './paginators.component';

describe('PaginatorsComponent', () => {
  let component: PaginatorsComponent;
  let fixture: ComponentFixture<PaginatorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaginatorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
