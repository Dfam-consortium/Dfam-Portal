import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: 'dfam-search-sequence-results',
  templateUrl: './search-sequence-results.component.html',
  styleUrls: ['./search-sequence-results.component.scss']
})
export class SearchSequenceResultsComponent implements OnInit {

  loading = true;

  submittedAt: string;
  duration: string;
  parameters: string;
  message: string;
  serverResponse: any;
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
    this.dfamapi.getSearchResults(id).subscribe(res => {
      this.serverResponse = res;

      if (res) {
        if (res.status === 'ERROR') {
          this.loading = false;
          this.message = res.message;
        } else if (res.message) {
          this.message = res.message;
          setTimeout(this.getResults.bind(this), 2000);
        } else if (res.results) {
          this.loading = false;
          this.message = null;

          res.results.forEach(function(result) {
            // Add 'row_id' values so the visualization can jump to the table rows
            let i = 0;
            result.hits.forEach(function(hit) {
              hit.row_id = 'annotation_' + (i++);

              // TODO: API says it returns numbers, but it returns strings
              [
                'bit_score', 'model_start', 'model_end',
                'ali_start', 'ali_end', 'seq_start', 'seq_end'
              ].forEach(key => {
                hit[key] = +hit[key];
              });
            });
            result.tandem_repeats.forEach(function(tr_hit) {
              tr_hit.row_id = 'annotation_' + (i++);
              // TODO: API says it returns numbers, but it returns strings
              ['start', 'end', 'repeat_length'].forEach(key => {
                tr_hit[key] = +tr_hit[key];
              });
            });
          });

          this.results = res.results;
          this.selectedResult = res.results[0];
        }
      } else {
        this.loading = false;
        this.message = 'An error occurred in contacting the server. Please try refreshing the page or re-submitting this search query.';
      }
    });
  }

  getAlignment(query) {
    const id = this.route.snapshot.params.id;
    return this.dfamapi.getSearchResultAlignment(id, query.sequence, query.seq_start, query.seq_end, query.accession);
  }
}
