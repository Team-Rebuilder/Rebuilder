import { Component, inject, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ScrollTopModule } from 'primeng/scrolltop';
import { ModelnavbarComponent } from '../modelnavbar/modelnavbar.component';
// import { PartListComponent } from '../part-list/part-list.component';
import { ModelsService } from '../../services/models.service';

@Component({
  selector: 'app-model',
  standalone: true,
  imports: [
    DatePipe,
    ModelnavbarComponent,
    // PartListComponent,
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
  id = input.required<string>();
  currModel$: any;

  async ngOnInit(): Promise<void> {
    this.currModel$ = await this.modelService.getModelById(this.id());
  }

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

  // Responsive Container Style
  containerStyle: any = {
    'width': '90vmin',
    'text-align': 'center'
  };
}
