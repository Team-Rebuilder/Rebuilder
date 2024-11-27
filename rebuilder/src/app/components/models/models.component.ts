import { Component } from '@angular/core';
import { HomeComponent } from '../homenavbar/home.component';


@Component({
  selector: 'app-models',
  standalone: true,
  imports: [HomeComponent],
  templateUrl: './models.component.html',
  styleUrl: './models.component.css'
})
export class ModelsComponent {

}
