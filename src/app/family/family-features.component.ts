import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

declare global {
  interface Window {
    dfamFamilyFeaturesVisualization(target: any, data: any): any;
  }
}

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

  @ViewChild('outlet') outlet: ElementRef;

  visualization: any;

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

      const el = this.outlet.nativeElement;
      el.innerHTML = "";
      if (data) {
        if (data.features.length > 0 || data.coding_seqs.length > 0) {
          this.visualization = window.dfamFamilyFeaturesVisualization(el, data);
        }
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    if (this.visualization) {
      this.visualization.render();
    }
  }

}
