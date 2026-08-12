import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../shared/services';
import { AltchaComponent } from '../shared/altcha/altcha.component';

import { MatDialog } from '@angular/material/dialog';

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
  @ViewChild(AltchaComponent, { static: false }) altcha: AltchaComponent;

  // Proof-of-work solution for the registration form. The widget solves a
  // challenge on load, so this is normally populated well before submission.
  altchaPayload = '';

  // The challenge endpoint lives on the backend API rather than the public one:
  // registration challenges expire and are single-use, which the challenges
  // served to the family browser deliberately are not.
  get altchaChallengeUrl(): string {
    return window.location.origin + '/api/backend/altcha';
  }

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

  onAltchaNotify(payload: string) {
    this.altchaPayload = payload;
  }

  submitForm(isAltchaRetry = false) {
    this.isSubmitting = true;
    this.message = null;

    const credentials = { email: this.email || "",
                          fullname: this.fullName || "",
                          password: this.password || "",
                          altchaPayload: this.altchaPayload };
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
          // A challenge can lapse between being solved and the form being
          // submitted. Solve a fresh one and resubmit, once, rather than
          // showing an error to someone who simply left the page open.
          if (this.loginType === 'register' && !isAltchaRetry && this.altcha &&
              err.error && err.error.code === 'altcha_expired') {
            this.altcha.solveAgain().then(payload => {
              this.altchaPayload = payload;
              this.submitForm(true);
            });
            return;
          }

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
