import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ErrorsService } from '../services/errors.service';
import { Family } from './types';

//
// TODO: Can this constant come from the app.json file so that it's easy to redirect?
//
const endpoint = '/api/';

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

  getFamilyHmm(accession: string): Observable<string> {
    const url = this.familyPath(accession) + '/hmm';

    const options = {
      params: new HttpParams().set('format', 'hmm'),
      responseType: 'text' as 'text',
    };
    return this.http.get(url, options)
      .pipe(catchError(this.handleError('getFamilyHmm', '')));
  }

  getFamilyHmmDownloadUrl(accession: string): string {
    return this.familyPath(accession) + '/hmm?format=hmm&download=true';
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

  getFamilyHmmLogoImageDownloadUrl(accession: string): string {
    return this.familyPath(accession) + '/hmm?format=image&download=true';
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

  getFamilySeedDownloadUrl(accession: string): string {
    return this.familyPath(accession) + '/seed?format=stockholm&download=true';
  }

  getFamilySeedPlot(accession: string): Observable<any> {
    const url = this.familyPath(accession) + '/seed';
    const options = {
      params: new HttpParams().set('format', 'alignment_summary'),
      responseType: 'json' as 'json',
    };
    return this.http.get(url, options)
      .pipe(catchError(this.handleError('getFamilySeedPlot', null)));
  }

  getFamilyEmblDownloadUrl(accession: string): string {
    return this.familyPath(accession) + '/sequence?format=embl&download=true';
  }

  getFamilyFastaDownloadUrl(accession: string): string {
    return this.familyPath(accession) + '/sequence?format=fasta&download=true';
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

  getFamilyAssemblyAnnotationsDownloadUrl(accession: string, assembly: string, nrph: boolean): string {
    return this.familyAssemblyPath(accession, assembly) +
      '/annotations?nrph=' + nrph.toString() + '&download=true';
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

  getTaxonById(id: number): Observable<any> {
    const url = endpoint + 'taxa/' + encodeURIComponent(id.toString());

    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError('getTaxonById', [])),
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
      catchError(this.handleError('getAnnotations', null)),
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
      catchError(this.handleError('getAlignment', null)),
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
      catchError(this.handleError('getSearchResultAlignment', null)),
    );
  }

  getBlogPosts(): Observable<any> {
    const url = endpoint + 'blogposts';

    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError('getBlogPosts', [])),
    );
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
