import { Component, Input, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';

import { CoveragePlot } from '../../js/conservation';

@Component({
  selector: 'dfam-family-model-coverage',
  templateUrl: './family-model-coverage.component.html',
  styleUrls: ['./family-model-coverage.component.scss']
})
export class FamilyModelCoverageComponent implements AfterViewChecked {

  private needsRedraw;

  _data;
  get data(): any {
    return this._data;
  }
  @Input()
  set data(data: any) {
    this._data = data;
    this.needsRedraw = true;
  }

  @Input() colorSet: number;

  @ViewChild('graph') graph: ElementRef;

  constructor() { }

  ngAfterViewChecked() {
    if (this.needsRedraw) {
      this.needsRedraw = false;
      const el = this.graph.nativeElement;
      el.innerHTML = '';
      if (this.data) {
        new CoveragePlot({ target: el, data: this.data, color_set: this.colorSet }).render();
      }
    }
  }

}
