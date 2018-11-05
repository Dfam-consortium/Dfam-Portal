import { Component, OnInit } from '@angular/core';
//import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../shared/services';

export interface Errors {
  errors: {[key: string]: string};
}

@Component({
  //selector: 'app-auth-page',
  selector: '',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']

})
export class AuthComponent implements OnInit {
  authType: String = '';
  title: String = '';
  errors: Errors = {errors: {}};
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.route.url.subscribe(data => {
      // Get the last piece of the URL (it's either 'login' or 'register')
      this.authType = data[data.length - 1].path;
      this.title = (this.authType === 'login') ? 'Sign in' : 'Register';
    });
  }

  submitForm(email, fullname, password) {
    this.isSubmitting = true;
    this.errors = {errors: {}};

    const credentials = { email: email, fullname: fullname, password: password };
    this.userService
    .attemptAuth(this.authType, credentials)
    .subscribe(
      data => this.router.navigateByUrl('/workbench/user'),
      err => {
        this.errors = err;
        this.isSubmitting = false;
      }
    );
  }
}
