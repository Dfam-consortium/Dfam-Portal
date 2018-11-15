import { Component, Input, OnChanges, OnInit, ElementRef, ViewChild } from '@angular/core';

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
export class FamilyModelLogoComponent implements OnInit {

  @Input() data;

  @ViewChild('logo') logo: ElementRef;

  logoObject: any;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.data) {
      const el = this.logo.nativeElement;
      el.innerHTML = '';
      this.logoObject = window.$(el).hmm_logo( { data: this.data });
    }
  }

  public scrollTo(position: number) {
    if (this.logoObject) {
      this.logoObject.scrollToColumn(position);
    }
  }
}
