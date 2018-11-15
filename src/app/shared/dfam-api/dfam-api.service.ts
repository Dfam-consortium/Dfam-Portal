import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { Family, FamilySummary } from './types';

//
// TODO: Can this constant come from the app.json file so that it's easy to redirect?
//
const endpoint = 'http://localhost:9925/';
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
    const body = res;
    return body || { };
  }

  private familyPath(accession: string): string {
    return endpoint + 'families/' + encodeURIComponent(accession);
  }

  private familyAssemblyPath(accession: string, id: string): string {
    return this.familyPath(accession) + '/assemblies/' + encodeURIComponent(id);
  }

  getFamily(accession: string): Observable<Family> {
    const url = this.familyPath(accession);
    return this.http.get<Family>(url)
      .pipe(catchError(this.handleError("getFamily", null)));
  }

  getFamilies(apiOptions: any): Observable<FamilySummary[]> {
    const url = endpoint + 'families';
    const options = {
      params: new HttpParams().set('format', 'summary')
    };

    if ( apiOptions.name ) {
      options.params = options.params.set('name', apiOptions.name);
    }

    if ( apiOptions.classification ) {
      options.params = options.params.set('classification', apiOptions.classification);
    }

    if ( apiOptions.clade ) {
      options.params = options.params.set('clade', apiOptions.clade);
    }

    if ( apiOptions.keywords ) {
      options.params = options.params.set('keywords', apiOptions.keywords);
    }

    options.params = options.params.set('start', (apiOptions.start || 0).toString());
    options.params = options.params.set('limit', (apiOptions.limit || 20).toString());

    if (apiOptions.sort) {
      options.params = options.params.set('sort', apiOptions.sort);
    }

    return this.http.get<FamilySummary[]>(url, options)
      .pipe(catchError(this.handleError("getFamilies", [])));
  }

  getFamilyHmm(accession: string): Observable<string> {
    const url = this.familyPath(accession) + '/hmm';

    const options = {
      params: new HttpParams().set('format', 'hmm'),
      responseType: 'text' as 'text',
    };
    return this.http.get(url, options)
      .pipe(catchError(this.handleError("getFamilyHmm", "")));
  }

  getFamilyHmmLogo(accession: string): Observable<any> {
    const url = this.familyPath(accession) + '/hmm';

    const options = {
      params: new HttpParams().set('format', 'logo'),
    };
    return this.http.get(url, options).pipe(
      map(this.extractData),
      catchError(this.handleError("getFamilyHmmLogo", null))
    );
  }

  getFamilyHmmLogoImage(accession: string): Observable<Blob> {
    const url = this.familyPath(accession) + '/hmm';

    const options = {
      params: new HttpParams().set('format', 'image'),
      responseType: 'blob' as 'blob',
    };
    return this.http.get(url, options).pipe(
      catchError(this.handleError("getFamilyHmmLogoImage", null))
    );
  }

  getFamilySeed(accession: string): Observable<string> {
    const url = this.familyPath(accession) + '/seed';
    const options = {
      params: new HttpParams().set('format', 'stockholm'),
      responseType: 'text' as 'text',
    };
    return this.http.get(url, options)
      .pipe(catchError(this.handleError("getFamilySeed", "")));
  }

  getFamilySeedGraph(accession: string): Observable<any> {
    const url = this.familyPath(accession) + '/seed';
    const options = {
      params: new HttpParams().set('format', 'graph'),
    };
    return this.http.get(url, options).pipe(
      map(this.extractData),
      catchError(this.handleError("getFamilySeedGraph", null))
    );
  }

  getFamilyRelationships(accession: string): Observable<any> {
    const url = this.familyPath(accession) + '/relationships';
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError("getFamilyRelationships", [])),
    );
  }

  getFamilyAssemblies(accession: string): Observable<any> {
    const url = this.familyPath(accession) + '/assemblies';
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError("getFamilyAssemblies", [])),
    );
  }

  getFamilyAssemblyModelCoverage(accession: string, assembly: string): Observable<any> {
    const url = this.familyAssemblyPath(accession, assembly) + '/model_coverage';
    const options = {
      params: new HttpParams().set('model', 'hmm'),
    };
    return this.http.get(url, options)
      .pipe(catchError(this.handleError("getFamilyAssemblyModelCoverage", null)));
  }

  getFamilyAssemblyModelConservation(accession: string, assembly: string): Observable<any> {
    const url = this.familyAssemblyPath(accession, assembly) + '/model_conservation';
    const options = {
      params: new HttpParams().set('model', 'hmm'),
    };
    return this.http.get(url, options)
      .pipe(catchError(this.handleError("getFamilyAssemblyModelConservation", null)));
  }

  getFamilyAssemblyAnnotations(accession: string, assembly: string, nrph: boolean): Observable<string> {
    const url = this.familyAssemblyPath(accession, assembly) + '/annotations';
    const options = {
      params: new HttpParams().set('nrph', nrph.toString()),
      responseType: 'text' as 'text',
    };
    return this.http.get(url, options)
      .pipe(catchError(this.handleError("getFamilyAssemblyAnnotations", "")));
  }

  getFamilyAssemblyAnnotationStats(accession: string, assembly: string): Observable<any> {
    const url = this.familyAssemblyPath(accession, assembly) + '/annotation_stats';
    return this.http.get(url)
      .pipe(catchError(this.handleError("getFamilyAssemblyAnnotationStats", null)));
  }

  getFamilyAssemblyKaryoImage(accession: string, assembly: string, nrph: boolean): Observable<Blob> {
    const url = this.familyAssemblyPath(accession, assembly) + '/karyoimage';
    const options = {
      params: new HttpParams().set('nrph', nrph.toString()).set('part', 'heatmap'),
      responseType: 'blob' as 'blob',
    };
    return this.http.get(url, options)
      .pipe(catchError(this.handleError("getFamilyAssemblyKaryoImage", null)));
  }

  getFamilyAssemblyKaryoImageHtmlMap(accession: string, assembly: string, nrph: boolean): Observable<string> {
    const url = this.familyAssemblyPath(accession, assembly) + '/karyoimage';
    const options = {
      params: new HttpParams().set('nrph', nrph.toString()).set('part', 'html_map'),
      responseType: 'text' as 'text',
    };
    return this.http.get(url, options)
      .pipe(catchError(this.handleError("getFamilyAssemblyKaryoImageHtmlMap", "")));
  }

  getFamilyAssemblyKaryoImageKey(accession: string, assembly: string, nrph: boolean): Observable<string> {
    const url = this.familyAssemblyPath(accession, assembly) + '/karyoimage';
    const options = {
      params: new HttpParams().set('nrph', nrph.toString()).set('part', 'img_key'),
      responseType: 'text' as 'text',
    };
    return this.http.get(url, options)
      .pipe(catchError(this.handleError("getFamilyAssemblyKaryoImageKey", "")));
  }

  getClasses(): Observable<any> {
    const url = endpoint + 'classes';
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError("getClasses", [])),
    );
  }

  // TODO: handling of name, limit
  getTaxa(annotated: boolean): Observable<any> {
    const url = endpoint + 'taxa';
    const options = {
      params: new HttpParams().set('name', '').set('limit', '20'),
    };

    if (annotated) {
      options.params = options.params.set('annotated', annotated.toString());
    }
    return this.http.get(url, options).pipe(
      map(this.extractData),
      catchError(this.handleError("getTaxa", [])),
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
    return this.http.post(endpoint + 'authenticate',
                          body.toString(), options).pipe(
                                catchError(this.handleError('login', {})))
                            .pipe(map(this.extractData));
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
    return this.http.post(endpoint + 'register',
                          body.toString(), options).pipe(
        catchError(this.handleError('register', {})),
        map(this.extractData));
  }


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
