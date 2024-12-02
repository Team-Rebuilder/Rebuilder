import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenderViewerComponent } from './render-viewer.component';

describe('RenderViewerComponent', () => {
  let component: RenderViewerComponent;
  let fixture: ComponentFixture<RenderViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenderViewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RenderViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
