import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-sequence',
  templateUrl: './search-sequence.component.html',
  styleUrls: ['./search-sequence.component.scss']
})
export class SearchSequenceComponent implements OnInit {

  search: any = {};

  constructor() { }

  ngOnInit() {
    this.onReset();
  }

  onSubmit() {
  }

  onReset() {
    this.search.sequence = "";
    this.search.assembly = "";
    this.search.cutoff = "curated";
    this.search.evalue = 0.001;
  }

  onExample() {
    this.search.sequence = "test";
    this.search.assembly = "hg38";
    this.search.cutoff = "curated";
    this.search.evalue = 0.001;
  }

}
