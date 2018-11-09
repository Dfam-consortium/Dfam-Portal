import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

declare global {
  interface Window {
    dfamOverlapPlot(target: any, data: {}): any;
  }
}

@Component({
  selector: 'dfam-family-relationships',
  templateUrl: './family-relationships.component.html',
  styleUrls: ['./family-relationships.component.scss']
})
export class FamilyRelationshipsComponent implements OnInit {

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute
  ) { }

  _relationships;
  get relationships(): [] {
    return this._relationships;
  }
  set relationships(value: []) {
    this._relationships = value;
    if (value.length) {
      window.dfamOverlapPlot(document.querySelector('#overlap'), value);
    }
  }

  ngOnInit() {
    this.getRelationships();
  }

  getRelationships() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamilyRelationships(accession).subscribe(rel => this.relationships = rel);
  }
}
