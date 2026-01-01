import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetakePage } from './retake-page';

describe('RetakePage', () => {
  let component: RetakePage;
  let fixture: ComponentFixture<RetakePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetakePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetakePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
