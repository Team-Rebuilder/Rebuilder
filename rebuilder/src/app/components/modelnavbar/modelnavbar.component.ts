import { Component, input, inject, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { ModelsService } from '../../services/models.service';

@Component({
  selector: 'app-modelnavbar',
  standalone: true,
  imports: [TabMenuModule],
  templateUrl: './modelnavbar.component.html',
  styleUrl: './modelnavbar.component.css'
})
export class ModelnavbarComponent {
  modelsService = inject(ModelsService);
  items: MenuItem[] | undefined;
  activeItem: MenuItem | undefined;
  id: string | undefined;
  currModel$: any;
  private getScreenWidth: number;

  constructor(private route: ActivatedRoute) {
    this.getScreenWidth = window.innerWidth;
    this.updateMenuItems();
  }

  // Refactored with the help of Copilot
  private updateMenuItems(has3DModel: boolean = false): void {
    const isWideScreen = this.getScreenWidth > 600;
    const baseItems = [
      {
        label: isWideScreen ? 'Details' : undefined,
        icon: 'pi pi-bars',
        routerLink: ['../details']
      },
      {
        label: isWideScreen ? 'Instructions' : undefined,
        icon: 'pi pi-info-circle',
        routerLink: ['../instructions']
      }
    ];

    if (has3DModel) {
      const threeDItem = {
        label: isWideScreen ? '3D' : undefined,
        icon: 'pi pi-box',
        routerLink: ['../three']
      };
      baseItems.push(threeDItem);
    }

    this.items = baseItems;
  }

  // Get screen width and height
  // https://dev.to/dhanush9952/angular-13-detect-width-and-height-of-screen-tutorial-1of9
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.updateMenuItems(this.currModel$?.threemodelUrls?.length > 0);
  }

  // Change the active item when clicked (taken from PrimeNG documentation)
  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }

  // Get the id from the URL (Written with the help of AI)
  // Use the old route param method since navbar isn't directly linked to route
  async ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id')!;
    });

    this.currModel$ = await this.modelsService.getModelById(this.id!);
    this.updateMenuItems(this.currModel$.threemodelUrls.length > 0);
    if (this.items && this.items.length > 0) {
      this.activeItem = this.items[0];
    }
  }
}
