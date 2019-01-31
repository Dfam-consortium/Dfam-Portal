import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: 'dfam-family-summary',
  templateUrl: './family-summary.component.html',
  styleUrls: ['./family-summary.component.scss']
})
export class FamilySummaryComponent implements OnInit {

  help = {
    classification: 'The Dfam classification for the family, and the specificity of the family',
    curation: '',
    citations: 'List of known citations for this family',
    aliases: 'Names for this family in other databases',
  };

  family;

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getFamily();
  }

  splitSemiPath(semiPath) {
    const path = semiPath.replace(/^root;/, '').split(';');

    let last = path.splice(path.length - 1, 1);
    if (last) {
      last = last[0];
    } else {
      last = null;
    }

    return { path: path.join('; '), last };
  }

  getFamily() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamily(accession).subscribe(data => {
      this.family = data;
      this.family.display_classification = this.splitSemiPath(this.family.classification);
      this.family.display_clades = this.family.clades.map(cn => this.splitSemiPath(cn));
    });
  }
}
