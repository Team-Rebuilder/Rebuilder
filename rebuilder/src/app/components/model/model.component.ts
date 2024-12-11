import { Component, inject, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { ScrollTopModule } from 'primeng/scrolltop';
import { ModelnavbarComponent } from '../modelnavbar/modelnavbar.component';
import { PartListComponent } from '../part-list/part-list.component';
import { ModelsService } from '../../services/models.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-model',
  standalone: true,
  imports: [
    DatePipe,
    ModelnavbarComponent,
    PartListComponent,
    CommonModule,
    GalleriaModule,
    ToastModule,
    TagModule,
    ScrollTopModule
  ],
  templateUrl: './model.component.html',
  styleUrl: './model.component.css',
  providers: [MessageService]
})
export class ModelComponent {
  modelService = inject(ModelsService);
  messageService = inject(MessageService);
  id = input.required<string>();
  currModel$: any;
  router = inject(Router);
  tempModelname: string = '';

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

  // Handle model deletion
  handleDelete = async () => {
    try {
      // Confirm deletion
      if (!confirm('Are you sure you want to delete this model?')) {
      return;
      }
      // Temporarily store the model name
      this.tempModelname = this.currModel$.title;

      await this.modelService.deleteModel(this.id());

      // Show a toast message
      this.messageService.add({severity: 'success', summary: 'Success', detail: `Model ${this.tempModelname} was deleted successfully! Redirecting to the models page...`});

      // Reset the tempModelname
      this.tempModelname = '';

      // Give some time for the toast message to show
      setTimeout(() => {
      // Redirect to the models page
      this.router.navigate(['../models']);
      }, 3000);
    } catch (error) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to delete model'});
      console.error('Error deleting model:', error);
    }
  }
}
