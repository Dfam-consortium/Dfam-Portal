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
  viewer: igv.Browser;
  resizeSubscription: Unsubscribable;
  ver_num: number;
  accession: string;
  url: string;
  full_accession: string;
  allTracks = false;

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
    this.accession = family?.accession
    this.url = `/api/families/${this.accession}`
    this.full_accession = this.accession + "." + this.ver_num;
  }

  async ngAfterViewInit() {
    await this.buildIGVBrowser();
  }

  async buildIGVBrowser() {
     let instance_track = {
      "name": "Seed Alignment",
      "type": "alignment",
      "format": "sam",
      "sourceType": "sam",
      "url": this.url + '/seed?format=sam',
      "displayMode": "SQUISHED",
      "autoHeight": true
    };
    const options = {
      reference: { fastaURL: this.url + '/sequence?format=fasta', indexed: false },
      tracks: [instance_track]
    };
    this.viewer = await igv.createBrowser(this.igvDiv.nativeElement, options);
    this.loading = false;
  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
  }

  async getAllTracks(){
    if (!this.allTracks) {
      this.loading = true;

      let ultra_data = await this.dfamapi.getULTRAData(this.accession).toPromise(); // TODO deprecated, newer rxjs uses firstValueFrom()
      let self_align_data = await this.dfamapi.getSelfAlignData(this.accession).toPromise();
      let homology_data = await this.dfamapi.getHomologyData(this.accession).toPromise();
      let protein_data = await this.dfamapi.getProteinData(this.accession).toPromise();
      
      // convert from 1-based, fully closed -> 0-based, half open, add accession
      if (ultra_data && ultra_data.length > 0) {
        ultra_data.forEach(f => {
          f.start -= 1;
          f.chr = this.full_accession;
        });
        const ultra_track = {
          "name": "Tandem Repeats (ULTRA)",
          "type": "annotation",
          "displayMode": "EXPANDED",
          "autoHeight": true,
          "features": ultra_data
        };
        this.viewer.loadTrack(ultra_track);
      }

      // convert from 1-based, fully closed -> 0-based, half open, add accession
      if (self_align_data && self_align_data.length > 0) {
        self_align_data.forEach(f => {
          f.start -= 1;
          f.pstart -= 1;
          f.sstart -= 1;
          f.chr = this.full_accession;
        });
        let self_align_track = {
          "name": "Self Alignments",
          "type": "selfpair",
          "url": this.url + '/self_alignments',
          "displayMode": "EXPANDED",
          "autoHeight": true,
          "features": self_align_data
        };
        this.viewer.loadTrack(self_align_track);
      }
      // console.log("Self Align Data:")
      // console.log(self_align_data)

      // convert from 1-based, fully closed -> 0-based, half open, add accession, build components
      if (homology_data && homology_data.length > 0) {
        homology_data.forEach(f => {
          f.start -= 1;
          f.ostart -= 1;
          f.chr = this.full_accession;
          f.components = [{
            "start": f.start,
            "end" : f.end,
            "ostart" : f.ostart,
            "oend" : f.oend,
            "seq" : f.seq,
            "oseq" : f.oseq,
            "cigar" : f.cigar
          }];
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
        this.viewer.loadTrack(dfam_relationship_track);
      }
      // console.log("Homology Data:")
      // console.log(homology_data)

      // convert from 1-based, fully closed -> 0-based, half open, add accession, build exons
      if (protein_data && protein_data.length > 0) {
        protein_data.forEach(f => {
          f.start -= 1;
          f.cdStart -= 1;
          f.oChromStart -= 1;
          f.chr = this.full_accession;
          f.cdStart = f.start;
          f.cdEnd = f.end;
          f.strand = f.oStrand;
          f.oChromStarts = f.oChromStart + ",";
          f.exons = [{
            "start": f.start,
            "end" : f.end,
            "cdStart" : f.cdStart,
            "cdEnd" : f.cdEnd,
          }];
        });
        let protein_homology_track =  {
          "name": "TE Protein Homology",
          "type": "annotation",
          "labelColor": "black",
          "displayMode": "EXPANDED",
          "autoHeight": true,
          "features": protein_data
        };
        this.viewer.loadTrack(protein_homology_track);
      }
      // console.log("Protein Data:")
      // console.log(protein_data)

      this.loading = false;
      this.allTracks = true;
    }
  }
}

