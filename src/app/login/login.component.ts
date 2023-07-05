import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../shared/services';

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']

})
export class LoginComponent implements OnInit {
  loginType = '';

  get title(): string {
    return (this.loginType === 'login') ? 'Sign in' : 'Register';
  }

  message: string;
  isSubmitting = false;

  fullName: string;
  email: string;
  password: string;

  @ViewChild('registerDone', { static: false }) registerDoneTemplate: TemplateRef<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.route.url.subscribe(data => {
      // Get the last piece of the URL (it's either 'login' or 'register')
      this.loginType = data[data.length - 1].path;
    });
  }

  submitForm() {
    this.isSubmitting = true;
    this.message = null;

    const credentials = { email: this.email || "",
                          fullname: this.fullName || "",
                          password: this.password || "" };
    this.authService
      .attemptAuth(this.loginType, credentials)
      .subscribe(
        data => {
          if (this.loginType === 'login') {
            this.router.navigateByUrl('/workbench/user');
          } else if (this.loginType === 'register') {
            this.message = '';
            this.isSubmitting = false;

            const dialog = this.dialog.open(this.registerDoneTemplate);
            dialog.afterClosed().subscribe(() => {
              this.router.navigateByUrl('/login');
            });
          }
        },
        err => {
          if (err.error && err.error.message) {
            this.message = err.error.message;
          } else if (err.statusText) {
            this.message = 'Error: ' + err.statusText;
          } else {
            this.message = err.toString();
          }

          this.isSubmitting = false;
        }
      );
  }
}
