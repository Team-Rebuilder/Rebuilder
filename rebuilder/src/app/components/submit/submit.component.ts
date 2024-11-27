import { Component } from '@angular/core';
import { HomeComponent } from '../homenavbar/home.component';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [HomeComponent],
  templateUrl: './submit.component.html',
  styleUrl: './submit.component.css'
})
export class SubmitComponent {

}
