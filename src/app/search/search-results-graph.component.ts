import { Component, OnInit, Input, OnChanges, ElementRef, ViewChild } from '@angular/core';

import { AnnotationsGraphic } from '../../js/annotations';

@Component({
  selector: 'dfam-search-results-graph',
  templateUrl: './search-results-graph.component.html',
  styleUrls: ['./search-results-graph.component.scss']
})
export class SearchResultsGraphComponent implements OnInit, OnChanges {

  @Input() data;

  @ViewChild('graph') graph: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    const el = this.graph.nativeElement;
    el.innerHTML = '';
    if (this.data) {
      new AnnotationsGraphic({ target: el, data: this.data }).render();
    }
  }

}
