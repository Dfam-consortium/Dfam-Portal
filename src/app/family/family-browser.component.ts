import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { fromEvent, Unsubscribable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import igv from 'dfam_igv.js/dist/igv.esm.min.js';

@Component({
  selector: 'dfam-family-browser',
  templateUrl: './family-browser.component.html',
  styleUrl: './family-browser.component.scss'
})
export class FamilyBrowserComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('igvDiv')
  private igvDiv: ElementRef;
  loading = true;
  viewer: igv;

  resizeSubscription: Unsubscribable;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(300))
      .subscribe(e => { if (this.viewer) { this.viewer.resize(); } });
  }

  async ngAfterViewInit() {
    const accession = this.route.parent.snapshot.params['id'];
  
    const url = `/api/families/${accession}`;
    const options = {
    reference: { fastaURL: url + '/sequence?format=fasta', indexed: false },
    tracks:
      [
        {
          "name": "TE Instances",
          "type": "alignment",
          "format": "sam",
          "sourceType": "sam",
          "url": url + '/seed?format=sam',
          "displayMode": "SQUISHED",
          "autoHeight": "True"
        },
      ]
    }

    this.viewer = await igv.createBrowser(this.igvDiv.nativeElement, options)
      .then(browser => {
        console.log("Created IGV browser");
        this.loading = false;
      })
  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
  }
}

