import { Component } from '@angular/core';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-modelnavbar',
  standalone: true,
  imports: [
    TabMenuModule
  ],
  templateUrl: './modelnavbar.component.html',
  styleUrl: './modelnavbar.component.css'
})
export class ModelnavbarComponent {
  items: MenuItem[] | undefined;
  activeItem: MenuItem | undefined;

  constructor() {
    this.items = [
      { label: 'Details', icon: 'pi ip-bars', routerLink: ['/model/:id'] },
      { label: '3D', icon: 'pi pi-box', routerLink: ['/model/:id/three'] },
      { label: 'Instructions', icon: 'pi pi-info-circle', routerLink: ['/model/:id/instructions'] }
    ];
    this.activeItem = this.items[0];
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }
}
