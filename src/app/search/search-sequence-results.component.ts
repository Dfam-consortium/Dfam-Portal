import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
    selector: 'dfam-search-sequence-results',
    templateUrl: './search-sequence-results.component.html',
    styleUrls: ['./search-sequence-results.component.scss'],
    standalone: false
})
export class SearchSequenceResultsComponent implements OnInit, OnDestroy {

  // Poll for results after 2s, waiting 1.5x longer each time up to 30s,
  // and stop after 30 minutes.
  static readonly POLL_START_MS = 2000;
  static readonly POLL_MAX_MS = 30000;
  static readonly POLL_GIVE_UP_MS = 30 * 60 * 1000;

  loading = true;

  submittedAt: string;
  duration: string;
  parameters: string;
  message: string;
  serverResponse: any;
  results: any;
  selectedResult: any;

  private pollDelay = SearchSequenceResultsComponent.POLL_START_MS;
  private pollStarted = Date.now();
  private pollTimer: ReturnType<typeof setTimeout>;
  private request: Subscription;

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getResults();
  }

  ngOnDestroy() {
    // Stop polling when the user leaves the page.
    clearTimeout(this.pollTimer);
    if (this.request) {
      this.request.unsubscribe();
    }
  }

  getResults() {
    const id = this.route.snapshot.params.id;
    this.request = this.dfamapi.getSearchResults(id).subscribe(res => {
      this.serverResponse = res;

      if (res) {
        if (res.status === 'ERROR') {
          this.loading = false;
          this.message = res.message;
        } else if (res.message) {
          this.message = res.message;
          this.schedulePoll();
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

  schedulePoll() {
    const C = SearchSequenceResultsComponent;
    if (Date.now() - this.pollStarted > C.POLL_GIVE_UP_MS) {
      this.loading = false;
      this.message = 'This search is taking longer than expected. Reload the page to check again.';
      return;
    }
    this.pollTimer = setTimeout(() => this.getResults(), this.pollDelay);
    this.pollDelay = Math.min(this.pollDelay * 1.5, C.POLL_MAX_MS);
  }

  getAlignment(query) {
    const id = this.route.snapshot.params.id;
    return this.dfamapi.getSearchResultAlignment(id, query.sequence, query.seq_start, query.seq_end, query.accession);
  }
}
