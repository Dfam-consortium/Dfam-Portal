import { Component, OnInit, OnDestroy, AfterViewChecked, Input, ElementRef, ViewChild } from '@angular/core';
import { fromEvent, Unsubscribable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { DfamAnnotationsGraphic, DfamAnnotationGraphicConfig } from '@sodaviz/dfam-soda';

@Component({
  selector: 'dfam-search-results-graph',
  templateUrl: './search-results-graph.component.html',
  styleUrls: ['./search-results-graph.component.scss']
})
export class SearchResultsGraphComponent implements OnInit, OnDestroy, AfterViewChecked {

  private needsRedraw;

  _data;
  get data(): any {
    return this._data;
  }

  @Input() set data(data: any) {
    this._data = data;
    this.needsRedraw = true;
  }

  @ViewChild('graph') graph: ElementRef;

  graphic;
  resizeSubscription: Unsubscribable;

  constructor() { }

  ngOnInit() {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(50))
      .subscribe(e => this.graphic?.resize());
  }

  ngAfterViewChecked() {
    if (this.needsRedraw) {
      this.needsRedraw = false;
      this.redraw();
    }
  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
  }

  redraw() {
    if (!this.graphic) {
      // create the chart from scratch only the first time
      const el = this.graph.nativeElement;
      el.innerHTML = '';

      const graphicConf: DfamAnnotationGraphicConfig = {
        selector: '.search-results-container',
        data: this.data,
        rowHeight: 14,
        zoomConstraint: [1, 10],
      };
      this.graphic = new DfamAnnotationsGraphic(graphicConf);
    }

    this.graphic.render(this.data);
  }

}
