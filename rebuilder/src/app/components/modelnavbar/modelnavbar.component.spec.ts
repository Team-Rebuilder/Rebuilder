import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelnavbarComponent } from './modelnavbar.component';

describe('ModelnavbarComponent', () => {
  let component: ModelnavbarComponent;
  let fixture: ComponentFixture<ModelnavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelnavbarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModelnavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
