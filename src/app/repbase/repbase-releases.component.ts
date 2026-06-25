import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Release, RepbaseService } from './repbase.service';

@Component({
  selector: 'dfam-repbase-releases',
  templateUrl: './repbase-releases.component.html',
  styleUrls: ['./repbase-releases.component.scss']
})
export class RepbaseReleasesComponent implements OnInit {
  allReleases: Release[] = [];
  filteredReleases: Release[] = [];
  filterText = '';

  constructor(private repbaseService: RepbaseService, private router: Router) {}

  ngOnInit(): void {
    this.repbaseService.getReleasesData().subscribe(data => {
      this.allReleases = data.releases;
      this.filteredReleases = data.releases;
    });
  }

  applyFilter(): void {
    const term = this.filterText.trim().toLowerCase();
    if (!term) {
      this.filteredReleases = this.allReleases;
    } else {
      this.filteredReleases = this.allReleases.filter(r =>
        r.release.toLowerCase().includes(term) || r.date.includes(term)
      );
    }
  }

  openRelease(release: Release): void {
    this.router.navigate(['/repbase/releases', release.release]);
  }

  hasEmbl(r: Release): boolean { return !!(r.files.embl?.length); }
  hasFasta(r: Release): boolean { return !!(r.files.fasta?.length); }
  hasRepeatMasker(r: Release): boolean { return !!(r.files.repeatmasker?.length); }
  hasRepet(r: Release): boolean { return !!(r.files.repet?.length); }
}
