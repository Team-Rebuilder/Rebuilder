import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { ModelsService } from '../../services/models.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TabMenuModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  items: MenuItem[] | undefined;
  activeItem: MenuItem | undefined;
  modelsService = inject(ModelsService);

  constructor() {
    this.items = [
      { label: 'MODELS', icon: 'pi pi-th-large', routerLink: ['/models'] },
      { label: 'SUBMIT', icon: 'pi pi-cloud-upload', routerLink: ['/submit'] }
    ];
    this.activeItem = this.items[0];
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }
}
