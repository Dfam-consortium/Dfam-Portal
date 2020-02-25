import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  styleUrls: ['./workbench-layout.component.scss'],
  templateUrl: './workbench-layout.component.html'
})
export class WorkbenchLayoutComponent {
  title = 'Dfam';

  showUploads = false;
  showBrowse = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.showUploads = (user.role === 'curator' || user.role === 'submitter');
      this.showBrowse = (user.role === 'curator');
    });
  }

  logout() {
    this.authService.purgeAuth();
    this.router.navigateByUrl('/home');
  }
}
