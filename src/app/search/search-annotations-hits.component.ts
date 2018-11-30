import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'dfam-search-annotations-hits',
  templateUrl: './search-annotations-hits.component.html',
  styleUrls: ['./search-annotations-hits.component.scss']
})
export class SearchAnnotationsHitsComponent implements OnInit {

  @Input() search: string;

  private _data: any[];
  get data(): any[] { return this._data; }

  @Input() set data(value: any[]) {
    if (!value) {
      value = [];
    }
    this._data = value;
    this.dataSource.data = value;
  };

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
    let data = '';
    if (this.data) {
      this.data.forEach(function(hit) {
        data += `${hit.sequence}\t${hit.accession}\t${hit.bit_score}\t${hit.e_value}\t` +
          `${hit.seq_start}\t${hit.seq_end}\t${hit.ali_start}\t${hit.ali_end}\t${hit.strand}\n`;
      });
    }
    const blob = new Blob([data], { type: 'text/plain' });
    window.saveAs(blob, 'search_results.hits');
  }

}
