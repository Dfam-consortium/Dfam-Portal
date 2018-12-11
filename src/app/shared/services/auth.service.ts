import { Injectable } from '@angular/core';
import { Observable ,  BehaviorSubject ,  ReplaySubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { DfamAPIService } from '../dfam-api/dfam-api.service';
import { JwtService } from './jwt.service';
import { map, distinctUntilChanged } from 'rxjs/operators';

// RMH: I like typescript but I would like to reuse code
//      in plain-old-ES5/ES6...so maybe less explicit typing??
export interface User {
  email: string;
  token: string;
  username: string;
  bio: string;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {

  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());
  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor (
    private dfamAPIService: DfamAPIService,
    private jwtService: JwtService,
    private jwtHelper: JwtHelperService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot ): Observable<boolean> {
     // return this.isAuthenticated.pipe(take(1), map(isAuth => !isAuth));
     console.log('I am checking ' + this.isAuthenticated );
     return this.isAuthenticated;
  }

  // Verify JWT in localstorage with server and load user's info.
  // This runs once on application startup.
  populate() {
    if (this.jwtService.getToken()) {
       // Use token to get details about who I am for the application use
    } else {
      // Remove any potential remnants of previous auth states
      this.purgeAuth();
    }
  }

  setAuth(user: User) {
    // Save JWT sent from server in localstorage
    this.jwtService.saveToken(user.token);
    // Set current user data into observable
    this.currentUserSubject.next(user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
  }

  purgeAuth() {
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    // Set current user to an empty object
    this.currentUserSubject.next({} as User);
    // Set auth status to false
    this.isAuthenticatedSubject.next(false);
  }

  attemptAuth(type, credentials): Observable<User> {
    if (type === 'login') {
      return this.dfamAPIService.login( credentials.email, credentials.password )
        .pipe(map(
        data => {
          const decodedToken = this.jwtHelper.decodeToken(data.token);
          const expirationDate = this.jwtHelper.getTokenExpirationDate(data.token);
          const isExpired = this.jwtHelper.isTokenExpired(data.token);
     // TODO: Remove
     console.log('user.service: JWT Details - ');
     console.log('raw data: ' + JSON.stringify(data));
     console.log('decoded token: ' + JSON.stringify(decodedToken));
     console.log('experiation date: ' + expirationDate);
     console.log('isExpired: ' + isExpired);
          // TODO: finish auth
          this.setAuth({
            email: null,
            token: data.token,
            username: null,
            bio: null,
            image: null,
          });
          return data;
        }
      ));
    } else if (type === 'register') {
      return this.dfamAPIService.register( credentials.fullname, credentials.email, credentials.password )
        .pipe(map(data => {
          return data;
        }));
    }
  }

  // Other useful endpoints
  //   /user  GET  <authenticated> get my details
  //   /user  UPDATE <authenticated> update my details
  //   /register PUT Submit registration request

}
