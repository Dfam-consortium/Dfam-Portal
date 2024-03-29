import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationEnd } from '@angular/router';

@Component({
  selector: 'dfam-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Dfam';

  constructor(private router: Router) {
     this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        (window as any).gtag('config', 'UA-135151408-1', {'page_path': event.urlAfterRedirects });
      }
    });
  }

}
