import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../shared/services/auth.service';

@Component({
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class WorkbenchUserComponent implements OnInit {
  title = 'Dfam';

  user: User;
  role: string;
  isNewUser: boolean;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(u => {
      this.user = u;
      // TODO: We could use the 'description' or another field for this,
      // but it needs to be exposed in the API first.
      if (u.role === 'curator') {
        this.role = 'Curator';
      } else if (u.role === 'applied') {
        this.role = 'New User';
      } else if (u.role === 'submitter') {
        this.role = 'Submitter';
      } else {
        this.role = u.role;
      }

      this.isNewUser = (u.role === 'applied');
    });
  }
}
