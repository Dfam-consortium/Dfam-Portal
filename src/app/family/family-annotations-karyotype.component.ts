import { Component, Input, OnChanges, OnInit, ElementRef, ViewChild } from '@angular/core';

declare global {
  interface Window {
    Karyotype: any;
  }
}

@Component({
  selector: 'dfam-family-annotations-karyotype',
  templateUrl: './family-annotations-karyotype.component.html',
  styleUrls: ['./family-annotations-karyotype.component.scss']
})
export class FamilyAnnotationsKaryotypeComponent implements OnInit {

  @Input() data;

  private dfamKaryotype;

  private _visualizationType: string;
  get visualizationType(): string { return this._visualizationType; }
  @Input() set visualizationType(kind: string) {
    this._visualizationType = kind;
    if (this.dfamKaryotype) {
      this.dfamKaryotype.switchVisualization(kind);
    }
  };

  @ViewChild('karyotype') karyotype: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.data) {
      const el = this.karyotype.nativeElement;
      el.innerHTML = '';
      this.dfamKaryotype = new window.Karyotype(el, this.data);
      this.dfamKaryotype.switchVisualization(this.visualizationType);
    }
  }

}
