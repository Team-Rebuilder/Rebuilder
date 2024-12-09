import { Component, inject, input } from '@angular/core';
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
  private modelsService = inject(ModelsService);
  private currModel$: any;

  id = input.required<string>();
  lDrawURL: string = "";

  async ngOnInit(): Promise<void> {
    this.currModel$ = await this.modelsService.getModelById(this.id());
    this.lDrawURL = this.currModel$.threemodelUrls[0];
  }
}
