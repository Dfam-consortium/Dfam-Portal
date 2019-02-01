import { Component, Input, OnChanges, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';

import { ConservationPlot } from '../../js/conservation';

@Component({
  selector: 'dfam-family-model-conservation',
  templateUrl: './family-model-conservation.component.html',
  styleUrls: ['./family-model-conservation.component.scss']
})
export class FamilyModelConservationComponent implements OnInit, OnChanges {

  @Input() data;

  @ViewChild('graph') graph: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  @HostListener('window:resize')
  onResize() {
    this.redraw();
  }

  ngOnChanges() {
    this.redraw();
  }

  redraw() {
    const el = this.graph.nativeElement;
    el.innerHTML = '';
    if (this.data) {
      new ConservationPlot({ target: el, data: this.data }).render();
    }
  }
}
