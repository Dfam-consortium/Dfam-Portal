import { Component, OnInit, AfterViewChecked, Input, ElementRef, ViewChild } from '@angular/core';
import { fromEvent, Unsubscribable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { DfamAnnotationsGraphic, DfamAnnotationGraphicConfig } from '@traviswheelerlab/dfam-soda';

@Component({
  selector: 'dfam-search-results-graph',
  templateUrl: './search-results-graph.component.html',
  styleUrls: ['./search-results-graph.component.scss']
})
export class SearchResultsGraphComponent implements OnInit, AfterViewChecked {

  private needsRedraw;

  _data;
  get data(): any {
    return this._data;
  }

  @Input() set data(data: any) {
    this._data = data;
    this.needsRedraw = true;
  };

  @ViewChild('graph') graph: ElementRef;

  graphic;
  resizeSubscription: Unsubscribable;

  constructor() { }

  ngOnInit() {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(50))
      .subscribe(e => this.redraw());
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
        target: el,
        data: this.data,
        binHeight: 14,
        scaleExtent: [1, Infinity],
        translateExtent: (chart) => [[0, 0], [chart.width, chart.height]],
      };
      this.graphic = new DfamAnnotationsGraphic(graphicConf);
    }

    this.graphic.render(this.data);
  }

}
