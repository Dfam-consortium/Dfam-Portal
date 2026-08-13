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

  // Proof-of-work solution for the registration form. Solved at submission
  // rather than on load, because the challenge is bound to the address being
  // registered and that is not known until the form is filled in.
  altchaPayload = '';

  // A number the user has to copy into a field before the form will be sent.
  //
  // This is not a security control: anything that renders the page can read the
  // number out of the label as easily as a person can. It is here because the
  // registrations being abused at the moment come from a client that posts the
  // form without reading it, so a field it does not know about stops it at no
  // cost to us. Expect it to buy time rather than to hold.
  //
  // Generated once when the component is constructed, so it changes on every
  // load of /register. The instruction lives in the field's label, which screen
  // readers announce -- unlike an image puzzle, this does not exclude anyone.
  readonly humanCheckNumber = Math.floor(1000 + Math.random() * 9000);
  humanCheckAnswer = '';

  get humanCheckPassed(): boolean {
    return this.humanCheckAnswer.trim() === String(this.humanCheckNumber);
  }

  // The challenge endpoint lives on the backend API rather than the public one:
  // registration challenges expire and are single-use, which the challenges
  // served to the family browser deliberately are not.
  get altchaChallengeUrl(): string {
    return window.location.origin + '/api/backend/altcha';
  }

  // The address is sent along so the server can bind it into the signed
  // challenge, which stops one solution being spent registering a different
  // address than the one it was issued for.
  private registerChallengeUrl(): string {
    const email = (this.email || '').trim();
    if (!email) {
      return this.altchaChallengeUrl;
    }
    return this.altchaChallengeUrl + '?email=' + encodeURIComponent(email);
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

  async submitForm(isAltchaRetry = false) {
    if (this.loginType === 'register' && !this.humanCheckPassed) {
      this.message = `Please enter the number ${this.humanCheckNumber} in the field above.`;
      return;
    }

    this.isSubmitting = true;
    this.message = null;

    // Solved here rather than on page load: the challenge is bound to the
    // address, so it cannot be issued until one has been typed. On the retry
    // path a fresh payload has already been solved by the error handler below.
    if (this.loginType === 'register' && !isAltchaRetry && this.altcha) {
      this.altchaPayload = await this.altcha.solveFor(this.registerChallengeUrl());
    }

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
            this.altcha.solveFor(this.registerChallengeUrl()).then(payload => {
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
