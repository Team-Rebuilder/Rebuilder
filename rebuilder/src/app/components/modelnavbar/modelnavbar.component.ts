import { Component, input, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';
import { ModelsService } from '../../services/models.service';

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
  has3DModel = input<boolean>();
  modelsService = inject(ModelsService);
  id: string | undefined;
  currModel$: any;

  constructor(private route: ActivatedRoute) {}

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
  }

  // Get the id from the URL (Written with the help of AI)
  // Use the old route param method since navbar isn't directly linked to route
  async ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get('id')!;
    });

    // Get the model by id
    // Since getModelById returns a promise, we need to await it
    this.currModel$ = await this.modelsService.getModelById(this.id!);

    // Conditionally display the 3D model tab
    this.items = this.currModel$.threemodelUrls.length > 0 ?
    [
      { label: 'Details', icon: 'pi pi-bars', routerLink: ['../details'] },
      { label: '3D', icon: 'pi pi-box', routerLink: ['../three'] },
      { label: 'Instructions', icon: 'pi pi-info-circle', routerLink: ['../instructions'] }
    ] :
    [
      { label: 'Details', icon: 'pi pi-bars', routerLink: ['../details'] },
      { label: 'Instructions', icon: 'pi pi-info-circle', routerLink: ['../instructions'] }
    ];

    this.activeItem = this.items[0];
  }
}
