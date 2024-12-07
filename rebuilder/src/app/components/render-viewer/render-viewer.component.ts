import { Component, inject } from '@angular/core';
import { ThreeDComponent } from '../three-d/three-d.component';
import { ModelnavbarComponent } from '../modelnavbar/modelnavbar.component';
import { ModelsService } from '../../services/models.service';

@Component({
  selector: 'app-render-viewer',
  standalone: true,
  imports: [ModelnavbarComponent, ThreeDComponent],
  templateUrl: './render-viewer.component.html',
  styleUrl: './render-viewer.component.css'
})
export class RenderViewerComponent {
  modelsService = inject(ModelsService);
  lDrawURL: string = "";

  ngOnInit(): void {
    this.modelsService.models$.subscribe(models => {
      this.lDrawURL = models[0].threemodelUrls[0];
    })
  }
}
