import { Component, Input, OnChanges, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'dfam-family-model-conservation',
  templateUrl: './family-model-conservation.component.html',
  styleUrls: ['./family-model-conservation.component.scss']
})
export class FamilyModelConservationComponent implements OnInit {

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
    if (this.data) {
      const el = this.graph.nativeElement;
      el.innerHTML = '';
      window.dfamConservationPlot(el, this.data);
    }
  }
}
