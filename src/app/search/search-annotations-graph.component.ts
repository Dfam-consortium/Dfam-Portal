import { Component, OnInit, Input, OnChanges, ElementRef, ViewChild } from '@angular/core';

declare global {
  interface Window {
    dfamAnnotationsGraphic(target: any, data: any): any;
  }
}

@Component({
  selector: 'dfam-search-annotations-graph',
  templateUrl: './search-annotations-graph.component.html',
  styleUrls: ['./search-annotations-graph.component.scss']
})
export class SearchAnnotationsGraphComponent implements OnInit, OnChanges {

  @Input() data;

  @ViewChild('graph') graph: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    const el = this.graph.nativeElement;
    el.innerHTML = '';
    if (this.data) {
      window.dfamAnnotationsGraphic(el, this.data);
    }
  }

}
