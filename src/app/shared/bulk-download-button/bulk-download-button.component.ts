import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dfam-bulk-download-button',
  templateUrl: './bulk-download-button.component.html',
  styleUrls: ['./bulk-download-button.component.scss']
})
export class BulkDownloadButtonComponent implements OnInit {
  
  @Input() downloadUrl: string;
  @Input() label: string;

  constructor() { }
  
  ngOnInit() {
  }

}