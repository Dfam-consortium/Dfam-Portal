import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ErrorsService } from '../services/errors.service';
import { Family } from './types';

//
// TODO: Can this constant come from the app.json file so that it's easy to redirect?
//
const endpoint = '/api/backend/';

@Injectable({
  providedIn: 'root'
})
export class DfamBackendAPIService {

  constructor(private http: HttpClient, private errorsService: ErrorsService) { }

  private extractData(res: Response) {
    const body = res;
    return body || { };
  }

  apiToken: string;

  private optsWithAuth(): { headers: HttpHeaders } {
    const opts = {
      headers: new HttpHeaders({
        "Authorization": "Bearer " + this.apiToken,
      }),
    };

    return opts;
  }

  getUser(): Observable<any> {
    const opts = this.optsWithAuth();
    return this.http.get(endpoint + 'user', opts).pipe(
      map(this.extractData),
      catchError(this.handleError('getUser', {})),
    );
  }

  private familyPath(accession: string): string {
    return endpoint + 'families/' + encodeURIComponent(accession);
  }

  getAssemblies(): Observable<any> {
    const url = endpoint + 'assemblies';
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError('getAssemblies', [])),
    );
  }

  getFamily(accession: string): Observable<Family> {
    const url = this.familyPath(accession);
    return this.http.get<Family>(url)
      .pipe(catchError(this.handleError('getFamily', null)));
  }

  // NB: If download is true, apiOptions.start and apiOptions.limit are ignored.
  // This corresponds most closely to the usual usage within Dfam-Portal.
  getFamiliesUrlOptions(apiOptions: any, format?: string, download?: boolean): [string, {params: HttpParams}] {
    const url = endpoint + 'families';
    const options = {
      params: new HttpParams().set('format', format || 'summary')
    };

    if ( apiOptions.name_accession ) {
      options.params = options.params.set('name_accession', apiOptions.name_accession);
    }

    if ( apiOptions.classification ) {
      options.params = options.params.set('classification', apiOptions.classification);
    }

    if ( apiOptions.clade ) {
      options.params = options.params.set('clade', apiOptions.clade);
    }

    if ( apiOptions.clade_ancestors && apiOptions.clade_descendants ) {
      options.params = options.params.set('clade_relatives', 'both');
    } else if ( apiOptions.clade_ancestors ) {
      options.params = options.params.set('clade_relatives', 'ancestors');
    } else if ( apiOptions.clade_descendants ) {
      options.params = options.params.set('clade_relatives', 'descendants');
    }

    if ( apiOptions.keywords ) {
      options.params = options.params.set('keywords', apiOptions.keywords);
    }

    if (download) {
      options.params = options.params.set('download', 'true');
    } else {
      options.params = options.params.set('start', (apiOptions.start || 0).toString());
      options.params = options.params.set('limit', (apiOptions.limit !== undefined ? apiOptions.limit : 20).toString());
    }

    if (apiOptions.sort) {
      options.params = options.params.set('sort', apiOptions.sort);
    }

    return [url, options];
  }

  getFamiliesDownloadUrl(apiOptions: any, format: string): string {
    let [url, options] = this.getFamiliesUrlOptions(apiOptions, format, true);
    return url + '?' + options.params.toString();
  }

  getFamilies(apiOptions: any): Observable<any> {
    let [url, options] = this.getFamiliesUrlOptions(apiOptions);
    return this.http.get<any>(url, options)
      .pipe(catchError(this.handleError('getFamilies', {})));
  }

  getClasses(name?: string): Observable<any> {
    const url = endpoint + 'classes';
    const options = {
      params: new HttpParams(),
      responseType: 'json' as 'json',
    };
    if (name) {
      options.params = options.params.set('name', name);
    }
    return this.http.get(url, options).pipe(
      map(this.extractData),
      catchError(this.handleError('getClasses', {})),
    );
  }

  // TODO: handling of name, limit
  getTaxa(name: string): Observable<any> {
    const url = endpoint + 'taxa';
    const options = {
      params: new HttpParams(),
    };

    if (name) {
      options.params = options.params.set('name', name);
    }

    return this.http.get(url, options).pipe(
      map(this.extractData),
      catchError(this.handleError('getTaxa', [])),
    );
  }

  getTaxonById(id: number): Observable<any> {
    const url = endpoint + 'taxa/' + encodeURIComponent(id.toString());

    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError('getTaxonById', [])),
    );
  }

  login(email, password): Observable<any> {
    const body = new HttpParams()
      .set('email', email)
      .set('password', password);

    const options = {
        headers: new HttpHeaders().set('Content-Type',
                      'application/x-www-form-urlencoded')
    };
    return this.http.post(
      endpoint + 'authenticate',
      body.toString(), options
    ).pipe(map(this.extractData));
  }

  register(fullname, email, password): Observable<any> {
    const body = new HttpParams()
      .set('email', email)
      .set('name', fullname)
      .set('password', password);

    const options = {
        headers: new HttpHeaders().set('Content-Type',
                      'application/x-www-form-urlencoded')
    };
    return this.http.post(
      endpoint + 'register',
      body.toString(),
      options
    ).pipe(map(this.extractData));
  }


  private handleError<T> (operation = 'operation', result: T) {
    return (error: any): Observable<T> => {
      // Short-circuit 404 without any error logging
      if (error.status === 404) {
        return of(result);
      }

      let message = `${operation} failed`;

      // API responses that are JSON objects are
      // available as the helpfully named 'error.error'
      if (error.error && error.error.message) {
        message += ': ' + error.error.message;
      } else if (error.statusText) {
        message += ': ' + error.statusText;
      }

      this.errorsService.logError({ message , error });

      // Let the app keep running by returning an empty result.
      return of(result);
    };
  }

}
