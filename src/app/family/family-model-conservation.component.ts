import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { fromEvent, Unsubscribable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { ConservationPlot } from '../../js/conservation';

@Component({
  selector: 'dfam-family-model-conservation',
  templateUrl: './family-model-conservation.component.html',
  styleUrls: ['./family-model-conservation.component.scss']
})
export class FamilyModelConservationComponent implements OnInit, OnDestroy {

  _data;
  get data(): any {
    return this._data;
  }

  @Input()
  set data(data: any) {
    this._data = data;
    this.redraw();
  }


  @ViewChild('graph', { static: true }) graph: ElementRef;

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
      new ConservationPlot({ target: el, data: this.data }).render();
    }
  }
}
