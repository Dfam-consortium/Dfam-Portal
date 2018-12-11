import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../shared/services';

export interface Errors {
  errors: {[key: string]: string};
}

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']

})
export class LoginComponent implements OnInit {
  loginType: String = '';
  title: String = '';
  errors: Errors = {errors: {}};
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
    this.errors = {errors: {}};

    const credentials = { email: this.email,
                          fullname: this.fullName,
                          password: this.password };
    if (this.loginType === 'login') {
      this.authService
        .attemptAuth(this.loginType, credentials)
        .subscribe(
          data => this.router.navigateByUrl('/workbench/user'),
          err => {
            this.errors = err;
            this.isSubmitting = false;
          }
        );
    } else {
      this.isSubmitting = false;
      this.router.navigateByUrl('/home');
    }
  }
}
