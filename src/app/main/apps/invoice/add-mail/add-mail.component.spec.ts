import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMailComponent } from './add-mail.component';

describe('AddMailComponent', () => {
  let component: AddMailComponent;
  let fixture: ComponentFixture<AddMailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
