import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: 'app-search-sequence-results',
  templateUrl: './search-sequence-results.component.html',
  styleUrls: ['./search-sequence-results.component.scss']
})
export class SearchSequenceResultsComponent implements OnInit {

  loading = true;
  message: string;
  results: any;
  selectedResult: any;

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getResults();
  }

  getResults() {
    const id = this.route.snapshot.params.id;
    this.dfamapi.getSearchResults(id).subscribe(results => {
      if (results) {
        if (results.status === 'ERROR') {
          this.loading = false;
          this.message = results.message;
        } else if (results.status === 'PEND') {
          this.message = results.message;
          setTimeout(this.getResults.bind(this), 2000);
        } else {
          this.loading = false;
          this.message = null;

          this.results = results;
          this.selectedResult = results[0];
        }
      }
    });
  }

  getAlignment(query) {
    const id = this.route.snapshot.params.id;
    console.log(query);
    return this.dfamapi.getSearchResultAlignment(id, query.sequence, query.seq_start, query.seq_end, query.accession);
  }
}
