import { Component, Input, OnChanges, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'dfam-family-model-hitprofile',
  templateUrl: './family-model-hitprofile.component.html',
  styleUrls: ['./family-model-hitprofile.component.scss']
})
export class FamilyModelHitprofileComponent implements OnInit {

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
      window.dfamHitProfilePlot(el, this.data);
    }
  }
}
