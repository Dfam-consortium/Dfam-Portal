import { Component, Input, AfterViewInit, OnChanges, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'dfam-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements AfterViewInit, OnChanges {

  @Input() data: any;
  @Input() showSequence: boolean;
  @Input() getAlignCallback;

  @ViewChild('tandemResultsSort') tandemResultsSort: MatSort;
  tandemColumns = ['sequence', 'type', 'start', 'end', 'repeat_length'];
  tandemResultsSource = new MatTableDataSource();

  constructor() { }

  ngAfterViewInit() {
    this.tandemResultsSource.sort = this.tandemResultsSort;
  }

  ngOnChanges() {
    if (this.data) {
      this.tandemResultsSource.data = this.data.tandem_repeats;
    }
  }

  onDownloadTandem() {
    let report = '';
    if (this.data) {
      this.data.tandem_repeats.forEach(function(hit) {
        report += `${hit.sequence}\t${hit.type}\t${hit.start}\t${hit.end}\t${hit.repeat_length}\n`;
      });
    }
    const blob = new Blob([report], { type: 'text/plain' });
    // window.saveAs(blob, 'search_results.hits'); TODO UPDATE
  }
}
