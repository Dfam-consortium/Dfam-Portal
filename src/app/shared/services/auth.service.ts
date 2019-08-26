import { Injectable } from '@angular/core';
import { Observable ,  BehaviorSubject ,  ReplaySubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';

import { DfamBackendAPIService } from '../dfam-api/dfam-backend-api.service';
import { map, concatAll, distinctUntilChanged } from 'rxjs/operators';

// RMH: I like typescript but I would like to reuse code
//      in plain-old-ES5/ES6...so maybe less explicit typing??
export interface User {
  email: string;
  name: string;
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
    private router: Router,
    private dfamBackendAPIService: DfamBackendAPIService,
    private jwtHelper: JwtHelperService
  ) {
    this.restore();
  }


  getStoredToken(): string {
    return window.localStorage['jwtToken'];
  }

  storeToken(token: string) {
    window.localStorage['jwtToken'] = token;
  }

  destroyToken() {
    window.localStorage.removeItem('jwtToken');
  }


  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean>
  {
    return this.isAuthenticated.pipe(map(isAuth => {
      if (!isAuth) {
        this.router.navigate(['/login']);
      }

      return isAuth;
    }));
  }

  // Verify JWT in localstorage with server and load user's info.
  // This runs once on application startup.
  restore() {
    let storedToken = this.getStoredToken();
    if (storedToken) {
      this.dfamBackendAPIService.apiToken = storedToken;
      this.loadUserData();
    } else {
      // Remove any potential remnants of previous auth states
      this.purgeAuth();
    }
  }

  setAuth(user: User) {
    // Set current user data into observable
    this.currentUserSubject.next(user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
  }

  purgeAuth() {
    // Remove JWT from localstorage
    this.destroyToken();
    // Set current user to an empty object
    this.currentUserSubject.next({} as User);
    // Set auth status to false
    this.isAuthenticatedSubject.next(false);
  }

  loadUserData(): Observable<User> {
    this.dfamBackendAPIService.getUser().subscribe(user => {
      this.setAuth(user);
    }, err => {
      // getUser is allowed for any authenticated user. A 403 means
      // the token is invalid, possibly due to expiration. So we
      // will just purge the token. Any other error is probably
      // temporary, so will leave the token in case waiting or
      // refreshing the page will resolve the issue.
      if (err.status === 403) {
        this.purgeAuth();
      }
    });

    return this.currentUser;
  }

  attemptAuth(type, credentials): Observable<User> {
    if (type === 'login') {
      return this.dfamBackendAPIService.login( credentials.email, credentials.password )
        .pipe(map(data => {
          // Save JWT sent from server in localstorage
          this.storeToken(data.token);
          this.dfamBackendAPIService.apiToken = data.token;

          return this.loadUserData();
        }), concatAll());
    } else if (type === 'register') {
      return this.dfamBackendAPIService.register( credentials.fullname, credentials.email, credentials.password )
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
