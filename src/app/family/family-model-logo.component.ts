import { Component, Input, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';

declare global {
  interface Window {
    $: any;
  }
}

@Component({
  selector: 'dfam-family-model-logo',
  templateUrl: './family-model-logo.component.html',
  styleUrls: ['./family-model-logo.component.scss']
})
export class FamilyModelLogoComponent implements AfterViewChecked {
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

  @ViewChild('logo') logo: ElementRef;

  logoObject: any;

  constructor() { }

  ngAfterViewChecked() {
    if (this.needsRedraw) {
      this.needsRedraw = false;
      if (this.data) {
        const el = this.logo.nativeElement;
        el.innerHTML = '';
        this.logoObject = window.$(el).hmm_logo( { data: this.data });
      }
    }
  }

  public scrollTo(position: number) {
    if (this.logoObject) {
      this.logoObject.scrollToColumn(position);
    }
  }
}
