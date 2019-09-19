import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../shared/services';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']

})
export class LoginComponent implements OnInit {
  loginType = '';
  title = '';
  error: string;
  isSubmitting = false;

  fullName: string;
  email: string;
  password: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.url.subscribe(data => {
      // Get the last piece of the URL (it's either 'login' or 'register')
      this.loginType = data[data.length - 1].path;
      this.title = (this.loginType === 'login') ? 'Sign in' : 'Register';
    });
  }

  submitForm() {
    this.isSubmitting = true;
    this.error = null;

    const credentials = { email: this.email,
                          fullname: this.fullName,
                          password: this.password };
    if (this.loginType === 'login') {
      this.authService
        .attemptAuth(this.loginType, credentials)
        .subscribe(
          data => this.router.navigateByUrl('/workbench/user'),
          err => {
            console.log(err);
            if (err.error && err.error.message) {
              this.error = err.error.message;
            } else if (err.statusText) {
              this.error = 'Error: ' + err.statusText;
            } else {
              this.error = err.toString();
            }

            this.isSubmitting = false;
          }
        );
    } else {
      this.isSubmitting = false;
      this.router.navigateByUrl('/home');
    }
  }
}
