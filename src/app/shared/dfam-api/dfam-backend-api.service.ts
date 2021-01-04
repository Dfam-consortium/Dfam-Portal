import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import { ErrorsService } from '../services/errors.service';
import { FamilyCriteria, FamilyRepository, FamilyResults, ClassesRepository, TaxaResults, TaxaRepository } from './common';
import { Family, Classification, Taxon } from './types';

//
// TODO: Can this constant come from the app.json file so that it's easy to redirect?
//
const endpoint = '/api/backend/';

@Injectable({
  providedIn: 'root'
})
export class DfamBackendAPIService implements FamilyRepository, ClassesRepository, TaxaRepository {

  apiToken: string;

  constructor(private http: HttpClient, private errorsService: ErrorsService) { }

  private extractData(res: Response) {
    const body = res;
    return body || { };
  }

  // Adds additional computed properties not returned by the API,
  // such as is_raw, for easier use in templates.
  private extendFamilyProperties(family: Family) {
    family.is_raw = family.accession.startsWith('DR');
  }

  private optsWithAuth(): { headers: HttpHeaders } {
    const opts = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.apiToken,
      }),
    };

    return opts;
  }

  getUser(): Observable<any> {
    const opts = this.optsWithAuth();
    return this.http.get(endpoint + 'user', opts);
  }

  getUploads(): Observable<any> {
    const opts = this.optsWithAuth();
    return this.http.get(endpoint + 'uploads', opts);
  }

  patchUpload(id: number, changeset: any): Observable<{}> {
    const url = endpoint + 'uploads/' + encodeURIComponent(id);
    const opts = this.optsWithAuth();
    return this.http.patch<any>(url, changeset, opts)
      .pipe(tap({ error: e => this.handleError('patchUpload', null) }));
  }

  getFlowConfig() {
    return {
      target: endpoint + 'upload',
      singleFile: true,
      chunkSize: 1000 * 1024, // slightly less than 1MB
      forceChunkSize: true,
      headers: {
        'Authorization': 'Bearer ' + this.apiToken,
      },
      permanentErrors: [400, 403, 415, 500, 501],
    };
  }

  private familyPath(accession: string): string {
    return endpoint + 'families/' + encodeURIComponent(accession);
  }

  getAssemblies(): Observable<any> {
    const url = endpoint + 'assemblies';
    const opts = this.optsWithAuth();
    return this.http.get(url, opts).pipe(
      map(this.extractData),
      catchError(this.handleError('getAssemblies', [])),
    );
  }

  getMetadata(): Observable<any> {
    const url = endpoint + 'metadata';
    const opts = this.optsWithAuth();
    return this.http.get<any>(url, opts)
      .pipe(catchError(this.handleError('getMetadata', null)));
  }

  getFamily(accession: string): Observable<Family> {
    const url = this.familyPath(accession);
    const opts = this.optsWithAuth();
    return this.http.get<Family>(url, opts)
      .pipe(
        catchError(this.handleError('getFamily', null)),
        tap(this.extendFamilyProperties),
      );
  }

  patchFamily(accession: string, changeset: any): Observable<{}> {
    const url = this.familyPath(accession);
    const opts = this.optsWithAuth();
    return this.http.patch<any>(url, changeset, opts)
      .pipe(tap({ error: e => this.handleError('patchFamily', null) }));
  }

  // NB: If download is true, criteria.start and criteria.limit are ignored.
  // This corresponds most closely to the usual usage within Dfam-Portal.
  getFamiliesUrlOptions(
    criteria: FamilyCriteria, format?: string, download?: boolean
  ): [string, { params: HttpParams; headers: HttpHeaders }] {
    const url = endpoint + 'families';
    const opts = this.optsWithAuth();
    const options = {
      headers: opts.headers,
      params: new HttpParams().set('format', format || 'summary'),
    };

    if ( criteria.name_accession ) {
      options.params = options.params.set('name_accession', criteria.name_accession);
    }

    if ( criteria.classification ) {
      options.params = options.params.set('classification', criteria.classification);
    }

    if ( criteria.clade ) {
      options.params = options.params.set('clade', criteria.clade);
    }

    if ( criteria.clade_ancestors && criteria.clade_descendants ) {
      options.params = options.params.set('clade_relatives', 'both');
    } else if ( criteria.clade_ancestors ) {
      options.params = options.params.set('clade_relatives', 'ancestors');
    } else if ( criteria.clade_descendants ) {
      options.params = options.params.set('clade_relatives', 'descendants');
    }

    if ( criteria.keywords ) {
      options.params = options.params.set('keywords', criteria.keywords);
    }

    if (download) {
      options.params = options.params.set('download', 'true');
    } else {
      options.params = options.params.set('start', (criteria.start || 0).toString());
      options.params = options.params.set('limit', (criteria.limit !== undefined ? criteria.limit : 20).toString());
    }

    if (criteria.sort) {
      options.params = options.params.set('sort', criteria.sort);
    }

    return [url, options];
  }

  getFamiliesDownloadUrl(criteria: FamilyCriteria, format: string): string {
    const [url, options] = this.getFamiliesUrlOptions(criteria, format, true);
    return url + '?' + options.params.toString();
  }

  getFamilies(criteria: FamilyCriteria): Observable<FamilyResults> {
    const [url, options] = this.getFamiliesUrlOptions(criteria);
    return this.http.get<FamilyResults>(url, options)
      .pipe(
        catchError(this.handleError('getFamilies', { results: [], total_count: 0 })),
        tap((res) => res.results.forEach(this.extendFamilyProperties)),
      );
  }

  getClasses(name?: string): Observable<Classification | Classification[]> {
    const url = endpoint + 'classes';
    const opts = this.optsWithAuth();
    const options = {
      headers: opts.headers,
      params: new HttpParams(),
      responseType: 'json' as 'json',
    };

    if (name) {
      options.params = options.params.set('name', name);
    }
    return this.http.get<Classification | Classification[]>(url, options).pipe(
      catchError(this.handleError('getClasses', [])),
    );
  }

  // TODO: handling of name, limit
  getTaxa(name: string): Observable<TaxaResults> {
    const url = endpoint + 'taxa';
    const opts = this.optsWithAuth();
    const options = {
      headers: opts.headers,
      params: new HttpParams(),
    };

    if (name) {
      options.params = options.params.set('name', name);
    }

    return this.http.get<TaxaResults>(url, options).pipe(
      catchError(this.handleError('getTaxa', { taxa: [] })),
    );
  }

  getTaxonById(id: number): Observable<Taxon> {
    const url = endpoint + 'taxa/' + encodeURIComponent(id.toString());
    const opts = this.optsWithAuth();

    return this.http.get<Taxon>(url, opts).pipe(
      catchError(this.handleError('getTaxonById', {} as Taxon)),
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

  verify(token): Observable<any> {
    const params = new HttpParams().set('token', token);
    return this.http.get(endpoint + 'verify', { params, observe: 'response' });
  }

  private handleError<T>(operation = 'operation', result: T) {
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
