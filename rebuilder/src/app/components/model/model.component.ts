import { Component, inject, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ScrollTopModule } from 'primeng/scrolltop';
import { ModelnavbarComponent } from '../modelnavbar/modelnavbar.component';
import { PartListComponent } from '../part-list/part-list.component';
import { ModelsService } from '../../services/models.service';
import { Router } from '@angular/router';
import { rebrickableKey } from '../../credentials';

interface Set {
  set_num: string;
  set_url: string;
}

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
    SkeletonModule,
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
  sourceSets: Set[] = [];
  router = inject(Router);
  tempModelname: string = '';

  async ngOnInit(): Promise<void> {
    this.currModel$ = await this.modelService.getModelById(this.id());
    await this.populateSourceSets();
  }

  // Responsive Container Style
  containerStyle: any = {
    'width': '90vmin',
    'text-align': 'center'
  };

  // Get the Rebrickable set page URL for a given set number
  async getSetUrl(setNumber: number): Promise<string> {
    const response = await fetch(`https://rebrickable.com/api/v3/lego/sets/${setNumber}-1/`, {
      headers: {
        'Authorization': `key ${rebrickableKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.set_url;
  }

  // Duplicate check implemented by Copilot
  async populateSourceSets(): Promise<void> {
    const setNumbers = this.currModel$.sourceSets;

    for (const setNumber of setNumbers) {
      // For each set object, check if its set_num matches the current setNumber
      const existingSet = this.sourceSets.find(set => set.set_num === setNumber);
      if (existingSet) {
        // Duplicate the existing entry
        this.sourceSets.push(existingSet);
      } else {
        // Fetch the set URL and add a new entry
        const setUrl = await this.getSetUrl(setNumber);
        this.sourceSets.push({set_num: setNumber, set_url: setUrl});
      }
    }
  }

  // Handle model deletion
  handleDelete = async () => {
    try {
      // Confirm deletion
      if (!confirm('Are you sure you want to delete this model?')) {
        return;
      }

      // Double check user's authorization
      if (this.currModel$?.uid !== this.modelService.currentUser?.uid) {
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'You are not authorized to delete this model'});
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
