import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

import { Overlap } from '../../js/overlap';

@Component({
  selector: 'dfam-family-relationships',
  templateUrl: './family-relationships.component.html',
  styleUrls: ['./family-relationships.component.scss']
})
export class FamilyRelationshipsComponent implements OnInit {

  help = 'An interactive representation of the relationships between TE families.';

  @ViewChild('outlet', { static: true }) outlet: ElementRef;

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
      new Overlap({ target: this.outlet.nativeElement, data: value }).render();
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
