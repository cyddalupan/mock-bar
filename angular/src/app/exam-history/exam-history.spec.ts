import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamHistory } from './exam-history';

describe('ExamHistory', () => {
  let component: ExamHistory;
  let fixture: ComponentFixture<ExamHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
