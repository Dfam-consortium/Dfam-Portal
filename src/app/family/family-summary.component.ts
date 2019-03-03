import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: 'dfam-family-summary',
  templateUrl: './family-summary.component.html',
  styleUrls: ['./family-summary.component.scss']
})
export class FamilySummaryComponent implements OnInit {

  taxa_expand = []

  help = {
    classification: 'The Dfam classification and the taxonomic specificity of the family',
    curation: 'Current curation status, length, and TSD preference',
    citations: 'List of known citations for this family',
    aliases: 'Identifiers for this family in other databases',
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
      for (let i = 0; i < this.family.clades.length; i++ ) {
        this.taxa_expand[i] = false;
      }
    });
  }
}
