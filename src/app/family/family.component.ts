import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Family } from '../shared/dfam-api/types';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';
import { FamilyDataService } from './family-data-service';

@Component({
  selector: 'dfam-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss']
})
export class FamilyComponent implements OnInit {

  navLinks = [
    { path: './summary', label: 'SUMMARY', available: true },
    { path: './browser', label: 'BROWSER', available: true },
    { path: './model', label: 'MODEL', available: true },
    { path: './annotations', label: 'ANNOTATIONS', available: true },
    { path: './download', label: 'DOWNLOAD', available: true },
  ];

  menuLabel = 'SUMMARY';

  family: Family;

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute,
    private familyDataService: FamilyDataService
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
      this.familyDataService.setFamily(this.family);
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
