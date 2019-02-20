import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: 'dfam-search-annotations',
  templateUrl: './search-annotations.component.html',
  styleUrls: ['./search-annotations.component.scss']
})
export class SearchAnnotationsComponent implements OnInit {

  search: any = {};

  assemblies: any[] = [];

  submitted: boolean;
  loading: boolean;
  results: any;

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getAssemblies();

    this.onReset();

    const query = this.route.snapshot.queryParamMap;
    let submit = false;
    if (query.has('assembly')) {
      this.search.assembly = query.get('assembly');
      submit = true;
    }
    if (query.has('chromosome')) {
      this.search.chromosome = query.get('chromosome');
      submit = true;
    }
    if (query.has('start')) {
      this.search.start = query.get('start');
      submit = true;
    }
    if (query.has('end')) {
      this.search.end = query.get('end');
      submit = true;
    }
    if (query.has('family')) {
      this.search.family = query.get('family');
      submit = true;
    }
    if (query.has('nrph')) {
      this.search.nrph = Boolean(query.get('nrph'));
      submit = true;
    }

    if (submit) {
      this.onSubmit();
    }
  }

  getAssemblies() {
    this.dfamapi.getAssemblies().subscribe(data => this.assemblies = data);
  }

  getAlignment(hit): Observable<any> {
    return this.dfamapi.getAlignment(this.results.assembly, hit.sequence, hit.seq_start, hit.seq_end, hit.accession);
  }

  onSubmit() {
    const parts = this.search.chromosome.trim().match(/^(\S+)[: ](\d+)[- ](\d+)$/);
    if (parts) {
      this.search.chromosome = parts[1];
      this.search.start = parts[2];
      this.search.end = parts[3];
    }

    this.submitted = true;
    this.loading = true;
    this.router.navigate([], { relativeTo: this.route, queryParams: this.search });

    const assembly = this.search.assembly;

    this.dfamapi.getAnnotations(
      this.search.assembly,
      this.search.chromosome.trim(),
      this.search.start,
      this.search.end,
      this.search.family.trim(),
      this.search.nrph
    ).subscribe(results => {
      this.loading = false;

      if (!results) {
        this.results = null;
        this.results.assembly = null;
        return;
      }

      // Add 'row_id' values so the visualization can jump to the table rows
      let i = 0;
      results.hits.forEach(function(hit) {
        hit.row_id = 'annotation_' + (i++);
      });
      results.tandem_repeats.forEach(function(tr_hit) {
        tr_hit.row_id = 'annotation_' + (i++);
      });

      this.results = results;
      this.results.assembly = assembly;
    });
  }

  onReset() {
    this.search.assembly = 'hg38';
    this.search.chromosome = '';
    this.search.start = '';
    this.search.end = '';
    this.search.family = '';
    this.search.nrph = true;
  }

  onExample() {
    this.search.assembly = 'hg38';
    this.search.chromosome = 'chr3';
    this.search.start = '147733000';
    this.search.end = '147766820';
    this.search.family = '';
    this.search.nrph = true;
  }
}
