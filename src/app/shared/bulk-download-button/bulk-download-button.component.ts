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
  data: object;

  constructor(
    private http: HttpClient
  ) { }
  
  ngOnInit() {
    this.status = this.label
    this.type = this.label.toLowerCase()
    this.waiting = false;
  }

  sleep(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
  }

  async startDownload() {
    this.waiting = true
    this.status = "Waiting..."
    while (this.waiting) {
      await this.requestDownload()
      if (this.data) {
        if (this.data['code'] === 200) {
            this.waiting = false
            this.status = this.label
            this.download = this.data['body']
            this.onDownload()

          } else if (this.data['code'] === 202) {
            this.status = "Working..."
          }
      }
      await this.sleep(5000)
    }
  }

  async requestDownload () { 
    return this.http.get(this.downloadUrl, { 
      observe: 'body', 
      responseType: 'json'
    }).subscribe( (data) => {
      this.data = data
    })
  }

  onDownload() {
    if (this.download) {
      const blob = new Blob([this.download], { type: 'text/plain' });
      window.saveAs(blob, `dfam-${this.type}-download.${this.type}`);
    }
  }
}