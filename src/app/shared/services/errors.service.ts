import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {

  private errorSubject$ = new Subject<string>();

  constructor() { }

  getErrorObservable(): Observable<string> {
    return this.errorSubject$;
  }

  logError(error: any) {

    const message = error.message || error.toString();
    this.errorSubject$.next(message);

    // TODO: send to logging infrastructure
    console.log(error);
  }

}
