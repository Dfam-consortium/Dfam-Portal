import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  styleUrls: ['./workbench-layout.component.scss'],
  templateUrl: './workbench-layout.component.html'
})
export class WorkbenchLayoutComponent {
  title = 'Dfam';

  constructor(private authService: AuthService, private router: Router) { }

  logout() {
    this.authService.purgeAuth();
    this.router.navigateByUrl('/home');
  }
}
