import { Component } from '@angular/core';
import { ThreeDComponent } from '../three-d/three-d.component';
import { ModelnavbarComponent } from '../modelnavbar/modelnavbar.component';

@Component({
  selector: 'app-render-viewer',
  standalone: true,
  imports: [ModelnavbarComponent, ThreeDComponent],
  templateUrl: './render-viewer.component.html',
  styleUrl: './render-viewer.component.css'
})
export class RenderViewerComponent {

}
