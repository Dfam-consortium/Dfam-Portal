import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../shared/services/auth.service';

@Component({
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class WorkbenchUserComponent implements OnInit {
  title = 'Dfam';

  user: User;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(u => this.user = u);
  }
}
