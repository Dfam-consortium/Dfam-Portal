import { Component, OnInit, OnChanges, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'dfam-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit, OnChanges {

  @Input() loading: boolean;
  @Input() diameter = 80;

  @ViewChild('container', { static: true }) container: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    let size = this.diameter;
    if (!this.loading) {
      size = 0;
    }
    this.container.nativeElement.style.minHeight = size + 'px';
  }

}
