import { Component, inject } from '@angular/core';
import { ThreeDComponent } from '../three-d/three-d.component';
import { ModelnavbarComponent } from '../modelnavbar/modelnavbar.component';
import { ModelsService } from '../../services/models.service';
import { ActivatedRoute } from '@angular/router';

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
  id: string | undefined;
  currModel$: any;

  constructor(private route: ActivatedRoute) {}

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id')!;
    });

    // Get the model by id
    // Since getModelById returns a promise, we need to await it
    this.currModel$ = await this.modelsService.getModelById(this.id!);

    this.modelsService.models$.subscribe(models => {
      this.lDrawURL = this.currModel$.threemodelUrls[0];
    })
  }
}
