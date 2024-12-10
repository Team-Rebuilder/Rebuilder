import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeComponent } from '../homenavbar/home.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    HomeComponent,
    RouterLink
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

}
