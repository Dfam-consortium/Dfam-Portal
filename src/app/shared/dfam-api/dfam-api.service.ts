import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { ErrorsService } from '../services/errors.service';
import { Family, FamilySummary } from './types';

//
// TODO: Can this constant come from the app.json file so that it's easy to redirect?
//
const endpoint = 'http://www.repeatmasker.org:10011/';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class DfamAPIService {

  constructor(private http: HttpClient, private errorsService: ErrorsService) { }

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

  getFamilies(apiOptions: any): Observable<any> {
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

    options.params = options.params.set('start', (apiOptions.start || 0).toString());
    options.params = options.params.set('limit', (apiOptions.limit || 20).toString());

    if (apiOptions.sort) {
      options.params = options.params.set('sort', apiOptions.sort);
    }

    return this.http.get<any>(url, options)
      .pipe(catchError(this.handleError('getFamilies', {})));
  }

  getFamilyHmm(accession: string): Observable<string> {
    const url = this.familyPath(accession) + '/hmm';

    const options = {
      params: new HttpParams().set('format', 'hmm'),
      responseType: 'text' as 'text',
    };
    return this.http.get(url, options)
      .pipe(catchError(this.handleError('getFamilyHmm', '')));
  }

  getFamilyHmmLogo(accession: string): Observable<any> {
    const url = this.familyPath(accession) + '/hmm';

    const options = {
      params: new HttpParams().set('format', 'logo'),
    };
    return this.http.get(url, options).pipe(
      map(this.extractData),
      catchError(this.handleError('getFamilyHmmLogo', null))
    );
  }

  getFamilyHmmLogoImage(accession: string): Observable<Blob> {
    const url = this.familyPath(accession) + '/hmm';

    const options = {
      params: new HttpParams().set('format', 'image'),
      responseType: 'blob' as 'blob',
    };
    return this.http.get(url, options).pipe(
      catchError(this.handleError('getFamilyHmmLogoImage', null))
    );
  }

  getFamilySeed(accession: string): Observable<string> {
    const url = this.familyPath(accession) + '/seed';
    const options = {
      params: new HttpParams().set('format', 'stockholm'),
      responseType: 'text' as 'text',
    };
    return this.http.get(url, options)
      .pipe(catchError(this.handleError('getFamilySeed', '')));
  }

  getFamilyRelationships(accession: string): Observable<any> {
    const url = this.familyPath(accession) + '/relationships';
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError('getFamilyRelationships', [])),
    );
  }

  getFamilyAssemblies(accession: string): Observable<any> {
    const url = this.familyPath(accession) + '/assemblies';
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError('getFamilyAssemblies', [])),
    );
  }

  getFamilyAssemblyModelCoverage(accession: string, assembly: string): Observable<any> {
    const url = this.familyAssemblyPath(accession, assembly) + '/model_coverage';
    const options = {
      params: new HttpParams().set('model', 'hmm'),
    };
    return this.http.get(url, options)
      .pipe(catchError(this.handleError('getFamilyAssemblyModelCoverage', null)));
  }

  getFamilyAssemblyModelConservation(accession: string, assembly: string): Observable<any> {
    const url = this.familyAssemblyPath(accession, assembly) + '/model_conservation';
    const options = {
      params: new HttpParams().set('model', 'hmm'),
    };
    return this.http.get(url, options)
      .pipe(catchError(this.handleError('getFamilyAssemblyModelConservation', null)));
  }

  getFamilyAssemblyAnnotations(accession: string, assembly: string, nrph: boolean): Observable<string> {
    const url = this.familyAssemblyPath(accession, assembly) + '/annotations';
    const options = {
      params: new HttpParams().set('nrph', nrph.toString()),
      responseType: 'text' as 'text',
    };
    return this.http.get(url, options)
      .pipe(catchError(this.handleError('getFamilyAssemblyAnnotations', '')));
  }

  getFamilyAssemblyAnnotationStats(accession: string, assembly: string): Observable<any> {
    const url = this.familyAssemblyPath(accession, assembly) + '/annotation_stats';
    return this.http.get(url)
      .pipe(catchError(this.handleError('getFamilyAssemblyAnnotationStats', null)));
  }

  getFamilyAssemblyKaryotype(accession: string, assembly: string): Observable<Blob> {
    const url = this.familyAssemblyPath(accession, assembly) + '/karyotype';
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError('getFamilyAssemblyKaryotype', null))
    );
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

  getAnnotations(assembly: string, chrom: string, start: number, end: number, family?: string, nrph?: boolean): Observable<any> {
    const url = endpoint + 'annotations';
    const options = {
      params: new HttpParams()
        .set('assembly', assembly)
        .set('chrom', chrom)
        .set('start', start.toString())
        .set('end', end.toString())
    };

    if (family !== null) {
      options.params = options.params.set('family', family);
    }

    if (nrph !== null) {
      options.params = options.params.set('nrph', nrph.toString());
    }

    return this.http.get(url, options).pipe(
      map(this.extractData),
      catchError(this.handleError('getAnnotations', {})),
    );
  }

  getAlignment(assembly: string, chrom: string, start: number, end: number, family: string): Observable<any> {
    const url = endpoint + 'alignment';
    const options = {
      params: new HttpParams()
        .set('assembly', assembly)
        .set('chrom', chrom)
        .set('start', start.toString())
        .set('end', end.toString())
        .set('family', family)
    };

    return this.http.get(url, options).pipe(
      map(this.extractData),
      catchError(this.handleError('getAlignment', {})),
    );
  }

  postSearch(sequence, organism, cutoff, evalue) {
    const url = endpoint + 'searches';
    const body = new HttpParams()
      .set('sequence', sequence)
      .set('organism', organism)
      .set('cutoff', cutoff)
      .set('evalue', evalue);

    const options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
    };
    return this.http.post(url, body.toString(), options).pipe(
      map(this.extractData),
      catchError(this.handleError('postSearch', null)),
    );
  }

  getSearchResults(id: string) {
    const url = endpoint + 'searches/' + id;

    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError('getSearchResults', null)),
    );
  }

  getSearchResultAlignment(id: string, sequence: string, start: number, end: number, family: string): Observable<any> {
    const url = endpoint + 'searches/' + id + '/alignment';

    const options = {
      params: new HttpParams()
        .set('sequence', sequence)
        .set('start', start.toString())
        .set('end', end.toString())
        .set('family', family)
    };

    return this.http.get(url, options).pipe(
      map(this.extractData),
      catchError(this.handleError('getSearchResultAlignment', {})),
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
      let message = `${operation} failed`;
      if (error.error && error.error.message) {
        message += ": " + error.error.message;
      }

      this.errorsService.logError({ message , error });

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
