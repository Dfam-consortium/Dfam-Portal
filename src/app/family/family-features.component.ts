import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: 'dfam-family-features',
  templateUrl: './family-features.component.html',
  styleUrls: ['./family-features.component.scss']
})
export class FamilyFeaturesComponent implements OnInit {

  help = {
    coding_seqs: 'Coding regions found in this family',
    features: 'Other features associated with this family',
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
