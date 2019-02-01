import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'dfam-family-download-button',
  templateUrl: './family-download-button.component.html',
  styleUrls: ['./family-download-button.component.scss']
})
export class FamilyDownloadButtonComponent implements OnInit {

  @Input() title: string;
  @Input() description: string;
  @Input('alt-description') altDescription: string;
  @Input() icon: string;
  @Input('button-url') buttonUrl: string;

  constructor() { }

  ngOnInit() {
  }
}
