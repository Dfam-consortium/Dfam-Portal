import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { fromEvent, Unsubscribable, forkJoin } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

import igv from 'dfam_igv.js/dist/igv.esm.min.js';

@Component({
  selector: 'dfam-family-browser',
  templateUrl: './family-browser.component.html',
  styleUrl: './family-browser.component.scss'
})
export class FamilyBrowserComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('igvDiv')
  private igvDiv: ElementRef;

  sam_data: string;
  ref_data: string;
  viewer: igv;

  resizeSubscription: Unsubscribable;

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(300))
      .subscribe(e => { if (this.viewer) { this.viewer.resize(); } });
  }

  async ngAfterViewInit() {
    const accession = this.route.parent.snapshot.params['id'];
  
    forkJoin({
      sam: this.dfamapi.getFamilySAMData(accession),
      ref: this.dfamapi.getFamilyConsensus(accession)
    }).subscribe(({ sam, ref }) => {
  
      const samBlob = new Blob([sam], { type: 'text/plain' });
      this.sam_data = URL.createObjectURL(samBlob);
  
      const refBlob = new Blob([ref], { type: 'text/plain' });
      this.ref_data = URL.createObjectURL(refBlob);
  
      this.buildBrowser();
    });
  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
    if (this.sam_data) URL.revokeObjectURL(this.sam_data);
    if (this.ref_data) URL.revokeObjectURL(this.ref_data);
  }

  async buildBrowser() {
    const options = {
      reference: { fastaURL: this.ref_data, indexed: false },
      tracks:
        [
          {
            "name": "TE Instances",
            "type": "alignment",
            "format": "sam",
            "sourceType": "sam",
            "url": this.sam_data,
            "displayMode": "SQUISHED",
            "autoHeight": "True"
          },
        ]
    }

    this.viewer = await igv.createBrowser(this.igvDiv.nativeElement, options)
      .then(function (browser) {
        console.log("Created IGV browser")
      })
  }
}

