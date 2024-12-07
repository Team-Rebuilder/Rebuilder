import { Component } from '@angular/core';
import { HomeComponent } from '../homenavbar/home.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    HomeComponent
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

}
