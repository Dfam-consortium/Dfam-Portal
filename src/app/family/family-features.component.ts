import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { fromEvent, Unsubscribable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

import { FeaturesVisualization } from '../../js/features';

@Component({
  selector: 'dfam-family-features',
  templateUrl: './family-features.component.html',
  styleUrls: ['./family-features.component.scss']
})
export class FamilyFeaturesComponent implements OnInit {

  help = {
    coding_seqs: 'Curated coding regions found in this family',
    features: 'Other features associated with this family',
  };

  family;

  @ViewChild('outlet', { static: true }) outlet: ElementRef;

  visualization: any;

  resizeSubscription: Unsubscribable;

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getFamily();

    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(300))
      .subscribe(e => { if (this.visualization) { this.visualization.render(); } });
  }

  getFamily() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamily(accession).subscribe(data => {
      this.family = data;

      const el = this.outlet.nativeElement;
      el.innerHTML = '';
      if (data) {
        if (data.features.length > 0 || data.coding_seqs.length > 0 || data.target_site_cons) {
          this.visualization = new FeaturesVisualization({ target: el, data });
          this.visualization.render();
        }
      }
    });
  }
}
