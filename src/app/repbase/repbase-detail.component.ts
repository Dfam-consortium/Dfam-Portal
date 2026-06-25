import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ARCHIVE_BASE, Release, RepbaseService } from './repbase.service';

@Component({
  selector: 'dfam-repbase-detail',
  templateUrl: './repbase-detail.component.html',
  styleUrls: ['./repbase-detail.component.scss']
})
export class RepbaseDetailComponent implements OnInit {
  release: Release | undefined;
  notFound = false;
  archiveBase = ARCHIVE_BASE;

  constructor(
    private route: ActivatedRoute,
    private repbaseService: RepbaseService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id') || '';
        return this.repbaseService.getReleaseById(id);
      })
    ).subscribe(release => {
      this.release = release;
      this.notFound = !release;
    });
  }

  downloadUrl(path: string): string {
    return `${this.archiveBase}/${path}`;
  }
}
