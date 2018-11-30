import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: 'app-search-annotations',
  templateUrl: './search-annotations.component.html',
  styleUrls: ['./search-annotations.component.scss']
})
export class SearchAnnotationsComponent implements OnInit {

  search: any = {};

  loading: boolean;
  results: any;

  assemblies: any[] = [];

  @ViewChild('tandemResultsSort') tandemResultsSort: MatSort;
  tandemColumns = ['sequence', 'type', 'start', 'end', 'repeat_length'];
  tandemResultsSource = new MatTableDataSource();

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.tandemResultsSource.sort = this.tandemResultsSort;

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

  onSubmit() {
    this.loading = true;
    this.router.navigate([], { relativeTo: this.route, queryParams: this.search });

    const assembly = this.search.assembly;

    this.dfamapi.getAnnotations(
      this.search.assembly,
      this.search.chromosome,
      this.search.start,
      this.search.end,
      this.search.family,
      this.search.nrph
    ).subscribe(results => {

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
      this.tandemResultsSource.data = results.tandem_repeats;
      this.loading = false;
    });
  }

  onReset() {
    this.search.assembly = 'hg38';
    this.search.chromosome = '';
    this.search.start = null;
    this.search.end = null;
    this.search.family = null;
    this.search.nrph = true;
  }

  onExample() {
    this.search.assembly = 'hg38';
    this.search.chromosome = 'chr3';
    this.search.start = '147733000';
    this.search.end = '147766820';
    this.search.family = null;
    this.search.nrph = true;
  }

  onDownloadTandem() {
    let data = '';
    if (this.results) {
      this.results.tandem_repeats.forEach(function(hit) {
        data += `${hit.sequence}\t${hit.type}\t${hit.start}\t${hit.end}\t${hit.repeat_length}\n`;
      });
    }
    const blob = new Blob([data], { type: 'text/plain' });
    window.saveAs(blob, 'search_results.hits');
  }
}
