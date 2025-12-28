import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamPage } from './exam-page';

describe('ExamPage', () => {
  let component: ExamPage;
  let fixture: ComponentFixture<ExamPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
