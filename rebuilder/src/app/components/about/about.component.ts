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
  constructor() {
    // Scroll to the top of the page on load
    this.scrollToTop(100, 'smooth');
  }

  // Function to scroll to the top of the page since navigation starts at the bottom
  // interval: time in milliseconds to wait before scrolling
  scrollToTop(interval: number, behavior: ScrollBehavior = 'smooth') {
    setTimeout(() => {
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo
      // https://stackoverflow.com/questions/11715646/scroll-automatically-to-the-bottom-of-the-page
      window.scrollTo({
        top: 0,
        behavior: behavior,
      });
    }, interval);
  }
}
