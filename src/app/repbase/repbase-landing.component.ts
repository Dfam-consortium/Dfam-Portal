import { Component, OnInit } from '@angular/core';
import { ArchiveFile, ARCHIVE_BASE, RepbaseService } from './repbase.service';

@Component({
  selector: 'dfam-repbase-landing',
  templateUrl: './repbase-landing.component.html',
  styleUrls: ['./repbase-landing.component.scss']
})
export class RepbaseLandingComponent implements OnInit {
  extras: ArchiveFile[] = [];
  releaseCount = 0;
  archiveBase = ARCHIVE_BASE;

  constructor(private repbaseService: RepbaseService) {}

  ngOnInit(): void {
    this.repbaseService.getReleasesData().subscribe(data => {
      this.extras = data.extras;
      this.releaseCount = data.releases.length;
    });
  }
}
