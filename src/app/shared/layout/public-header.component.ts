import { Component } from '@angular/core';

import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'dfam-public-layout-header',
  styleUrls: ['./public-header.component.scss'],
  templateUrl: './public-header.component.html'
})
export class PublicHeaderComponent {
  constructor(private authService: AuthService) {}

  isAuthenticated: Observable<boolean> = this.authService.isAuthenticated;

}
