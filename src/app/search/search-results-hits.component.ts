import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'dfam-search-results-hits',
  templateUrl: './search-results-hits.component.html',
  styleUrls: ['./search-results-hits.component.scss']
})
export class SearchResultsHitsComponent implements OnInit {

  @Input() search: string;
  @Input() getAlignCallback;

  private _data: any[];
  get data(): any[] { return this._data; }

  @Input() set data(value: any[]) {
    if (!value) {
      value = [];
    }
    this._data = value;
    this.dataSource.data = value;
  }

  @Input() assembly: string;

  @ViewChild('sort') sort: MatSort;
  columns = ['expander', 'sequence', 'accession', 'bit_score', 'e_value',
    'model_start', 'model_end', 'ali_start', 'ali_end', 'strand'];
  dataSource = new MatTableDataSource();

  constructor() { }

  ngOnInit() {
    this.dataSource.sort = this.sort;
  }

  onDownload() {
    let data = 'sequence name\tmodel accession\tmodel name\tbit score\te-value\tmodel start\tmodel end\tstrand\talignment start\talignment end\tenvelope start\tenvelope end\n';
    if (this.data) {
      this.data.forEach(function(hit) {
        data += `${hit.sequence}\t${hit.accession}\t${hit.query}\t` +
          `${hit.bit_score}\t${hit.e_value}\t${hit.model_start}\t${hit.model_end}\t` +
          `${hit.strand}\t` +
          `${hit.ali_start}\t${hit.ali_end}\t${hit.seq_start}\t${hit.seq_end}\n`;
      });
    }
    const blob = new Blob([data], { type: 'text/plain' });
    window.saveAs(blob, 'search_results.hits');
  }

}
