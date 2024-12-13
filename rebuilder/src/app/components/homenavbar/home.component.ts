import { Component, inject, HostListener } from '@angular/core';
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
  private getScreenWidth: number;

  // Adapted from PrimeNG template
  constructor() {
    this.getScreenWidth = window.innerWidth;
    this.updateMenuItems();
  }

  // Refactored with the help of Copilot
  private updateMenuItems(): void {
    const isWideScreen = this.getScreenWidth > 600;
    this.items = isWideScreen ? [
      { label: 'MODELS', icon: 'pi pi-th-large', routerLink: ['/models'] },
      { label: 'SUBMIT', icon: 'pi pi-cloud-upload', routerLink: ['/submit'] }
    ] : [
      { icon: 'pi pi-th-large', routerLink: ['/models'] },
      { icon: 'pi pi-cloud-upload', routerLink: ['/submit'] }
    ];
    this.activeItem = this.items[0];
  }

  // Get screen width and height
  // https://dev.to/dhanush9952/angular-13-detect-width-and-height-of-screen-tutorial-1of9
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.updateMenuItems();
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }
}
