import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'dfam-bulk-download-button',
  templateUrl: './bulk-download-button.component.html',
  styleUrls: ['./bulk-download-button.component.scss']
})
export class BulkDownloadButtonComponent implements OnInit {
  
  @Input() downloadUrl: string; // url with family search arguments from browse-panel
  @Input() label: string;       // type of download button

  status: string;               // the text rendered on the button
  download: string;             // the data to be downloaded as a file
  type: string;                 // type of data, lowercased from label
  waiting: boolean;             // variable controlling the http request loop
  data: object = {code: 202};   // http response variable, start with code 202 to kick off request

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
    this.waiting = true                         // start loop

    while (this.waiting) {
      if (this.data['code'] === 200) {          // when job is done
          this.waiting = false                  // stop waiting
          this.status = this.label              // reset button label
          this.download = this.data['body']     // set download variable
          break                                 // break loop to avoid last sleep
          
      } else if (this.data['code'] === 202) {   // if job is working, or first request
        this.status = "Working..."              // change button label
        this.data = {code: 0}                   // set code to 0 so that loop conditions are skipped until request finishes
        await this.requestDownload()            // initiate request
      }
      await this.sleep(5000)                    // pause requests
    }

    this.onDownload()                           // after loop trigger file download
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