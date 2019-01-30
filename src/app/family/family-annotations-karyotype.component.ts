import { Component, Input, OnChanges, OnInit, ElementRef, ViewChild } from '@angular/core';

import Karyotype from 'Karyotype/src/Karyotype';

@Component({
  selector: 'dfam-family-annotations-karyotype',
  templateUrl: './family-annotations-karyotype.component.html',
  styleUrls: ['./family-annotations-karyotype.component.scss']
})
export class FamilyAnnotationsKaryotypeComponent implements OnInit, OnChanges {

  @Input() data;

  private dfamKaryotype;

  private _visualizationType: string;
  get visualizationType(): string { return this._visualizationType; }
  @Input() set visualizationType(kind: string) {
    this._visualizationType = kind;
    if (this.dfamKaryotype) {
      this.dfamKaryotype.switchVisualization(kind);
    }
  }

  @ViewChild('karyotype') karyotype: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    const el = this.karyotype.nativeElement;
    el.innerHTML = '';
    this.dfamKaryotype = null;

    if (this.data) {
      this.dfamKaryotype = new Karyotype(el, this.data);
      this.dfamKaryotype.switchVisualization(this.visualizationType);
    }
  }

}
