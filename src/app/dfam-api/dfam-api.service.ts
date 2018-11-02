import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

// TODO: Can this constant come from the app.json file so that it's easy to redirect?
const endpoint = 'http://www.repeatmasker.org:10010/';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class DfamAPIService {

  constructor(private http: HttpClient) { }

  private extractData(res: Response) {
    let body = res;
    return body || { };
  }

  // Example:  An existing RmDB API endpoint to get sumary data for families
  getFamilies(name_prefix): Observable<any> {
    
    if ( name_prefix )
      return this.http.get(endpoint + 'dfamFamilies?name_prefix=' + name_prefix ).pipe(
        map(this.extractData));
    else
      return this.http.get(endpoint + 'dfamFamilies').pipe(
        map(this.extractData));
  }

  // TODO: Insert real Dfam-API endpoints here

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
  
      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
  
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
