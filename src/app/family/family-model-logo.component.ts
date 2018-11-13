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

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.data) {
      const el = this.logo.nativeElement;
      el.innerHTML = '';
      window.$(el).hmm_logo( { data: this.data });
    }
  }
}
