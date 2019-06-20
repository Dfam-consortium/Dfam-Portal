import { Component, Input, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';

import Karyotype from 'Karyotype/src/Karyotype';

@Component({
  selector: 'dfam-family-annotations-karyotype',
  templateUrl: './family-annotations-karyotype.component.html',
  styleUrls: ['./family-annotations-karyotype.component.scss']
})
export class FamilyAnnotationsKaryotypeComponent implements AfterViewChecked {

  private needsRedraw;

  private _data: any;
  get data(): any { return this._data; }
  @Input() set data(data: any) {
    this._data = data;
    this.needsRedraw = true;
  }

  private dfamKaryotype;

  private _visualizationType: string;
  get visualizationType(): string { return this._visualizationType; }
  @Input() set visualizationType(kind: string) {
    this._visualizationType = kind;
    if (this.dfamKaryotype) {
      this.dfamKaryotype.switchVisualization(kind);
    }
    this.needsRedraw = true;
  }

  @ViewChild('karyotype', { static: false }) karyotype: ElementRef;

  constructor() { }

  ngAfterViewChecked() {
    if (this.needsRedraw) {
      this.needsRedraw = false;
      const el = this.karyotype.nativeElement;
      el.innerHTML = '';
      this.dfamKaryotype = null;

      if (this.data) {
        this.dfamKaryotype = new Karyotype(el, this.data);
        this.dfamKaryotype.switchVisualization(this.visualizationType);
      }
    }
  }

}
