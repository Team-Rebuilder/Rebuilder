import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ScrollTopModule } from 'primeng/scrolltop';
import { HomeComponent } from '../homenavbar/home.component';
import { ModelsService } from '../../services/models.service';


@Component({
  selector: 'app-models',
  standalone: true,
  imports: [
    HomeComponent,
    CommonModule,
    RouterLink,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    ScrollTopModule
  ],
  templateUrl: './models.component.html',
  styleUrl: './models.component.css'
})
export class ModelsComponent {
  modelsService = inject(ModelsService);
  router = inject(Router);
  searchTerm: string = '';
  strictSearch: boolean = false;
  filteredModels: any[] = [];

  constructor() {
    // If searchTerm is empty, display all models
    if (this.searchTerm === '') {
      this.modelsService.models$.subscribe(models => {
        this.filteredModels = models;
      });
    }
  }

  // Helper function to normalize text by removing diacritics
  // Written by Copilot Edits
  private normalizeText(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  toggleStrictSearch() {
    this.strictSearch = !this.strictSearch;
    this.handleSearchChange();
  }

  // Filter models based on search term
  // Written with the help of AI
  handleSearchChange() {
    if (this.searchTerm.trim() !== '') {
      this.modelsService.models$.subscribe(models => {
        const normalizedSearch = this.normalizeText(this.searchTerm.toLowerCase());

        // Filter models based on search term
        if (this.strictSearch) {
          this.filteredModels = models.filter(
            (model: any) => this.normalizeText(model.category.toLowerCase()).startsWith(normalizedSearch)
          );
        } else {
          this.filteredModels = models.filter(
            (model: any) => this.normalizeText(model.category.toLowerCase()).includes(normalizedSearch)
          );
        }
      });
      console.log("model is being filtered");
    } else {
      this.modelsService.models$.subscribe(models => {
        this.filteredModels = models;
      });
    }
  }

  // Clear search term and display all
  emptySearch() {
    this.searchTerm = '';
    this.modelsService.models$.subscribe(models => {
      this.filteredModels = models;
    });
  }

  // Navigate to model details page
  navigateToDetails(modelId: string) {
    this.router.navigate(['/model', modelId, 'details']);
  }
}
