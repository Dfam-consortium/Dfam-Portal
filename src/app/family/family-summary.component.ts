import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: 'dfam-family-summary',
  templateUrl: './family-summary.component.html',
  styleUrls: ['./family-summary.component.scss']
})
export class FamilySummaryComponent implements OnInit {

  help = {
    classification: "The Dfam classification for the family, and the specificity of the family",
    curation: "",
    citations: "List of known citations for this family",
    aliases: "Names for this family in other databases",
  };

  family;

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getFamily();
  }

  getFamily() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamily(accession).subscribe(data => {
      this.family = data;
    });
  }
}
