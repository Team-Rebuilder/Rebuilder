import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
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
    AsyncPipe,
    CardModule,
    ButtonModule,
    TagModule,
    ScrollTopModule
  ],
  templateUrl: './models.component.html',
  styleUrl: './models.component.css'
})
export class ModelsComponent {
  modelsService = inject(ModelsService);
}
