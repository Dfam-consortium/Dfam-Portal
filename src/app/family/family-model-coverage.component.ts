import { Component, Input, OnChanges, OnInit, ElementRef, ViewChild } from '@angular/core';

import { CoveragePlot } from '../../js/conservation';

@Component({
  selector: 'dfam-family-model-coverage',
  templateUrl: './family-model-coverage.component.html',
  styleUrls: ['./family-model-coverage.component.scss']
})
export class FamilyModelCoverageComponent implements OnInit, OnChanges {

  @Input() data;
  @Input() colorSet: number;

  @ViewChild('graph') graph: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.data) {
      const el = this.graph.nativeElement;
      el.innerHTML = '';
      new CoveragePlot({ target: el, data: this.data, color_set: this.colorSet }).render();
    }
  }

}
