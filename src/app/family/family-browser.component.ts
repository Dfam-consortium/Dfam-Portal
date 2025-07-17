import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { fromEvent, Unsubscribable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import igv from 'dfam_igv.js/dist/igv.esm.min.js';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';
import { FamilyDataService } from './family-data-service';

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
  ver_num: number;

  constructor(
    private route: ActivatedRoute,
    private dfamapi: DfamAPIService,
    private familyDataService: FamilyDataService
  ) { }

  ngOnInit() {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(300))
      .subscribe(e => { if (this.viewer) { this.viewer.resize(); } });

    const family = this.familyDataService.getFamily();
    this.ver_num = family?.version;
  }

  async ngAfterViewInit() {
    const accession = this.route.parent.snapshot.params['id'];
    const url = `/api/families/${accession}`;
    const full_accession = accession + "." + this.ver_num;

    let instance_track = {
      "name": "TE Instances",
      "type": "alignment",
      "format": "sam",
      "sourceType": "sam",
      "url": url + '/seed?format=sam',
      "displayMode": "SQUISHED",
      "autoHeight": true
    };
    let tracks: Array<object> = [instance_track];

    let ultra_data = await this.dfamapi.getULTRAData(accession).toPromise(); // TODO deprecated, newer rxjs uses firstValueFrom()
    let self_align_data = await this.dfamapi.getSelfAlignData(accession).toPromise();
    let homology_data = await this.dfamapi.getHomologyData(accession).toPromise();
    let protein_data = await this.dfamapi.getProteinData(accession).toPromise();
    
    // convert from 1-based, fully closed -> 0-based, half open, add accession
    if (ultra_data && ultra_data.length > 0) {
      ultra_data.forEach(f => {
        f.start -= 1;
        f.chr = full_accession;
      });
      const ultra_track = {
        "name": "ULTRA",
        "type": "annotation",
        "displayMode": "EXPANDED",
        "autoHeight": true,
        "features": ultra_data
      };
      tracks.push(ultra_track)
    }

    // convert from 1-based, fully closed -> 0-based, half open, add accession
    if (self_align_data && self_align_data.length > 0) {
      self_align_data.forEach(f => {
        f.start -= 1;
        f.pstart -= 1;
        f.sstart -= 1;
        f.chr = full_accession;
      });
      let self_align_track = {
        "name": "Self Alignments",
        "type": "selfpair",
        "url": url + '/self_alignments',
        "displayMode": "EXPANDED",
        "autoHeight": true,
        "features": self_align_data
      };
      tracks.push(self_align_track)
    }

    // convert from 1-based, fully closed -> 0-based, half open, add accession, build components
    if (homology_data && homology_data.length > 0) {
      homology_data.forEach(f => {
        f.start -= 1;
        f.ostart -= 1;
        f.chr = full_accession;
        f.components = [{
          "start": f.start,
          "end" : f.end,
          "ostart" : f.ostart,
          "oend" : f.oend,
          "seq" : f.seq,
          "oseq" : f.oseq,
          "cigar" : f.cigar
        }]
        delete f.seq;
        delete f.oseq;
        delete f.cigar;
      });
      let dfam_relationship_track =  {
        "name": "Dfam Relationships",
        "type": "chain",
        "displayMode": "EXPANDED",
        "autoHeight": true,
        "features": homology_data
      };
      tracks.push(dfam_relationship_track)
    }

    // convert from 1-based, fully closed -> 0-based, half open, add accession, build exons
    if (protein_data && protein_data.length > 0) {
      protein_data.forEach(f => {
        f.start -= 1;
        f.cdStart -= 1;
        f.oChromStart -= 1;
        f.chr = full_accession;
        f.cdStart = f.start;
        f.cdEnd = f.end;
        f.strand = f.oStrand;
        f.oChromStarts = f.oChromStart;
        f.exons = [{
          "start": f.start,
          "end" : f.end,
          "cdStart" : f.cdStart,
          "cdEnd" : f.cdEnd,
        }]
      });
      let protein_homology_track =  {
        "name": "TE Protein Homology",
        "type": "annotation",
        "labelColor": "black",
        "displayMode": "EXPANDED",
        "autoHeight": true,
        "features": protein_data
      }
      tracks.push(protein_homology_track)
    }

    await this.buildIGVBrowser(url, tracks)
  }

  async buildIGVBrowser(url: String, tracks: Array <object>) {
    const options = {
      reference: { fastaURL: url + '/sequence?format=fasta', indexed: false },
      tracks: tracks
    }
    this.viewer = await igv.createBrowser(this.igvDiv.nativeElement, options)
      .then(browser => {
        this.loading = false;
    })
  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
  }
}

