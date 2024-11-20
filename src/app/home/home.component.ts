import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SearchSequenceComponent } from '../search/search-sequence.component';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private dfamapi: DfamAPIService,
    private router: Router,
  ) {}

  showMore1 = false;
  dfamBlogArticles = [];

  releaseData: string;

  searchSequence: string;
  searchSequenceAssemblies: any[] = [];
  searchSequenceAssembly = 'hg38';
  searchSubmitting: boolean;


  assemblies: any[] = [];
  annotations = {
    assembly: 'hg38',
    chromosome: '',
    start: '',
    end: '',
  };

  gotoEntryTarget: string;

  searchKeywords: string;

  ngOnInit() {
    this.dfamapi.getAssemblies().subscribe(data => {
      this.assemblies = data;

      this.searchSequenceAssemblies = Array.from(data);
      this.searchSequenceAssemblies.push({ id: 'other', name: 'Other' });
    });
    // this.dfamapi.getFamilies({ include_raw: true, limit: 0 }).subscribe(data => this.totalFamilies = data.total_count);
    // this.dfamapi.getFamilies({ limit: 0 }).subscribe(data => this.curatedFamilies = data.total_count);
    // this.dfamapi.getTaxaCoverage().subscribe(data => this.coveredSpecies = data.count);
    this.dfamapi.getVersionData().subscribe(data => {
      // this.totalFamilies = data.total_families
      // this.curatedFamilies = data.curated_families
      // this.coveredSpecies = data.species
      this.releaseData = ` release ${data.dfam_version} (${data.release_date})`
    })
    this.dfamapi.getBlogPosts().subscribe(data => this.dfamBlogArticles = data.slice(0, 1));
  }

  searchByKeywords() {
    this.router.navigate(['browse'], { queryParams: { 'keywords': this.searchKeywords } });
  }

  onGotoEntry() {
    const LIMIT = 20;
    const searchTerm = this.gotoEntryTarget;

    this.dfamapi.getFamilies({
      'name_accession': searchTerm,
      'limit': LIMIT,
    }).subscribe((data: any) => {
      let found = false;
      if (data.total_count > 0) {
        // At least one match
        data.results.forEach(result => {
          if (result.accession === searchTerm || result.name === searchTerm) {
            this.router.navigate(['family', result.accession]);
            found = true;
          }
        });
      }

      if (!found) {
        this.router.navigate(['browse'], { queryParams: { 'name_accession': searchTerm } });
      }
    });
  }

  onSubmitSearch() {
    this.searchSubmitting = true;

    // TODO: This is not quite right;
    // See similar TODO in ../search/search-sequence.component.ts
    const assembly = this.searchSequenceAssemblies.find(a => a.id === this.searchSequenceAssembly);
    if (assembly) {
      this.dfamapi.postSearch(this.searchSequence, assembly.name, 'curated', 0).subscribe(result => {
        this.searchSubmitting = false;
        if (result && result.id) {
          this.router.navigate(['search', 'results', result.id]);
        } else {
          // TODO: Report an error status
        }
      });
    }
  }

  onExampleSearch() {
    this.searchSequence = SearchSequenceComponent.example.sequence;
    this.searchSequenceAssembly = 'hg38';
  }

  onGotoAnnotations() {
    this.router.navigate(['search', 'annotations'], { queryParams: {
      'assembly': this.annotations.assembly,
      'chromosome': this.annotations.chromosome,
      'start': this.annotations.start,
      'end': this.annotations.end,
      'nrph': true,
    } });
  }

  onExampleAnnotations() {
    this.annotations.assembly = 'hg38';
    this.annotations.chromosome = 'chr3';
    this.annotations.start = '147733000';
    this.annotations.end = '147766820';
  }
}
