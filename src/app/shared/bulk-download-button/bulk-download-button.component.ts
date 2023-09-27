import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'dfam-bulk-download-button',
  templateUrl: './bulk-download-button.component.html',
  styleUrls: ['./bulk-download-button.component.scss']
})
export class BulkDownloadButtonComponent implements OnInit {
  
  @Input() downloadUrl: string;
  @Input() label: string;

  status: string;
  download: string;
  type: string;
  waiting: boolean;
  reloadInterval: number = 5;

  constructor(
    private http: HttpClient
  ) { }
  
  ngOnInit() {
    this.status = this.label
    this.type = this.label.toLowerCase()
    this.waiting = false;
  }

  requestDownload () {
    this.waiting = true
    this.status = "Working..."
    this.http.get(this.downloadUrl, { 
      observe: 'body', 
      responseType: 'json'
    }).subscribe( (data) => {
      if (data['code'] === 200) {
        this.waiting = false
        this.status = this.label
        this.download = data['body']
        this.onDownload()
      } else if (data['code'] === 202) {
        // TODO
      }
    })
  }

  onDownload() {
    if (this.download) {
      const blob = new Blob([this.download], { type: 'text/plain' });
      window.saveAs(blob, `dfam-${this.type}-download.${this.type}`);
    }
  }
}