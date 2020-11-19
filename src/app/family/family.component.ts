import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Family } from '../shared/dfam-api/types';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: 'dfam-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss']
})
export class FamilyComponent implements OnInit {

  navLinks = [
    { path: './summary', label: 'SUMMARY', available: true },
    { path: './seed', label: 'SEED', available: true },
    { path: './features', label: 'FEATURES', available: true },
    { path: './model', label: 'MODEL', available: true },
    { path: './annotations', label: 'ANNOTATIONS', available: true },
    { path: './relationships', label: 'RELATIONSHIPS', available: true },
    { path: './download', label: 'DOWNLOAD', available: true },
  ];

  menuLabel = 'SUMMARY';

  family: Family;

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    const initialPath = this.route.snapshot.firstChild.routeConfig.path;
    this.navLinks.forEach(nl => {
      if ('./' + initialPath === nl.path) {
        this.setMenuLabel(nl.label);
      }
    });
    this.getFamily();
  }

  setMenuLabel(label) {
    this.menuLabel = label;
  }

  getFamily() {
    const accession = this.route.snapshot.params['id'];
    this.dfamapi.getFamily(accession).subscribe((data: Family) => {
      this.family = data;
      this.navLinks.forEach(l => {
        l.available = true;

        // Annotation lists are not made for raw families, so we
        // hide the tab that will definitely be empty for those.
        if (this.family.is_raw && l.path === './annotations') {
          l.available = false;
        }
      });
    });
  }

}
