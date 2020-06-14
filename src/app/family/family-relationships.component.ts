import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

import { Overlap } from '../../js/overlap';

@Component({
  selector: 'dfam-family-relationships',
  templateUrl: './family-relationships.component.html',
  styleUrls: ['./family-relationships.component.scss']
})
export class FamilyRelationshipsComponent implements AfterViewInit {

  help = 'An interactive representation of the relationships between TE families.';

  filter = {
    include: "all",
    include_raw: false,
  };

  @ViewChild('outlet') outlet: ElementRef;

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
    this.outlet.nativeElement.innerText = '';
    if (value && value.length) {
      new Overlap({ target: this.outlet.nativeElement, data: value }).render();
    }
  }

  ngAfterViewInit() {
    this.getRelationships();
  }

  filterChanged() {
    this.relationships = null;
    this.getRelationships();
  }

  getRelationships() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamilyRelationships(
      accession,
      this.filter.include,
      this.filter.include_raw,
    ).subscribe(rel => this.relationships = rel);
  }
}
