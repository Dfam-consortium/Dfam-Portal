import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';


export interface ArchiveFile {
  name: string;
  path: string;
  size_mb: number;
  date: string;
  sha256: string;
}

export interface ReleaseFiles {
  embl?: ArchiveFile[];
  fasta?: ArchiveFile[];
  repeatmasker?: ArchiveFile[];
  repet?: ArchiveFile[];
}

export interface Release {
  release: string;
  date: string;
  files: ReleaseFiles;
}

export interface ReleasesData {
  releases: Release[];
  extras: ArchiveFile[];
}

export const ARCHIVE_BASE = environment.apiBase;

@Injectable({ providedIn: 'root' })
export class RepbaseService {
  private data$: Observable<ReleasesData>;

  constructor(private http: HttpClient) {
    //this.data$ = this.http.get<ReleasesData>(`${ARCHIVE_BASE}/releases.json`).pipe(
    this.data$ = this.http.get<ReleasesData>(`${environment.apiBase}/releases.json`).pipe(
      shareReplay(1)
    );
  }

  getReleasesData(): Observable<ReleasesData> {
    return this.data$;
  }

  getReleaseById(id: string): Observable<Release | undefined> {
    return this.data$.pipe(
      map(data => data.releases.find(r => r.release === id))
    );
  }
}
