import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { fromEvent, Unsubscribable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { AnnotationsGraphic } from '../../js/annotations';

@Component({
  selector: 'dfam-search-results-graph',
  templateUrl: './search-results-graph.component.html',
  styleUrls: ['./search-results-graph.component.scss']
})
export class SearchResultsGraphComponent implements OnInit {

  _data;
  get data(): any {
    return this._data;
  }

  @Input() set data(data: any) {
    this._data = data;
    this.redraw();
  };

  @ViewChild('graph') graph: ElementRef;

  graphic;
  resizeSubscription: Unsubscribable;

  constructor() { }

  ngOnInit() {
    this.redraw();

    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(300))
      .subscribe(e => this.redraw());
  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
  }

  redraw() {
    const el = this.graph.nativeElement;
    el.innerHTML = '';
    if (this.data) {
      this.graphic = new AnnotationsGraphic({ target: el, data: this.data }).render();
    }
  }

}
