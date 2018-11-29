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

  @ViewChild('karyotype') karyotype: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.data) {
      const el = this.karyotype.nativeElement;
      el.innerHTML = '';
      new window.Karyotype(el, this.data);
    }
  }

}
