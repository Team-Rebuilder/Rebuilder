import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ScrollTopModule } from 'primeng/scrolltop';
import { ModelnavbarComponent } from '../modelnavbar/modelnavbar.component';
import { ModelsService } from '../../services/models.service';

@Component({
  selector: 'app-model',
  standalone: true,
  imports: [
    DatePipe,
    ModelnavbarComponent,
    CommonModule,
    GalleriaModule,
    ToastModule,
    TagModule,
    ScrollTopModule
  ],
  templateUrl: './model.component.html',
  styleUrl: './model.component.css'
})
export class ModelComponent {
  modelService = inject(ModelsService);
  id: string | undefined;
  currModel$: any;

  // Responsive options for the galleria
  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  constructor(private route: ActivatedRoute) {}

  // Get the id from the URL (Written with the help of AI)
  async ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id')!;
    });

    // Get the model by id
    // Since getModelById returns a promise, we need to await it
    this.currModel$ = await this.modelService.getModelById(this.id!);
  }
}
