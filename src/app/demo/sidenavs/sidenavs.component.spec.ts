import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavsComponent } from './sidenavs.component';

describe('SidenavsComponent', () => {
  let component: SidenavsComponent;
  let fixture: ComponentFixture<SidenavsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidenavsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
