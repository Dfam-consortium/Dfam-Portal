import { Component, AfterViewInit } from '@angular/core';

import { AuthService } from '../../shared/services/auth.service';
import { DfamBackendAPIService } from '../../shared/dfam-api/dfam-backend-api.service';

@Component({
  selector: 'dfam-workbench-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class WorkbenchUsersComponent implements AfterViewInit {

  loading = true;
  users = [];
  displayColumns = ['name', 'email', 'role', 'verified', 'actions'];

  constructor(
    private dfambackendapi: DfamBackendAPIService,
    private authService: AuthService,
  ) { }

  ngAfterViewInit() {
    this.getUsers();
  }

  getUsers() {
    this.dfambackendapi.getUsers().subscribe(data => {
      this.users = data;
      this.loading = false;
    });
  }

  approveSubmitter(user) {
    this.dfambackendapi.patchUser(user.id, { role: 'submitter' }).subscribe(_response => {
      this.getUsers();
    });
  }
}
