import { Component, AfterViewChecked, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'dfam-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements AfterViewChecked {

  @Input() loading: boolean;
  @Input() diameter = 80;

  @ViewChild('container') container: ElementRef;

  constructor() { }

  ngAfterViewChecked() {
    let size = this.diameter;
    if (!this.loading) {
      size = 0;
    }
    this.container.nativeElement.style.minHeight = size + 'px';
  }

}
