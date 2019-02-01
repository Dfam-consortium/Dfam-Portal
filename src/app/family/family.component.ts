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
    { path: './summary', label: 'SUMMARY' },
    { path: './seed', label: 'SEED' },
    { path: './features', label: 'FEATURES' },
    { path: './model', label: 'MODEL' },
    { path: './annotations', label: 'ANNOTATIONS' },
    { path: './relationships', label: 'RELATIONSHIPS' },
    { path: './download', label: 'DOWNLOAD' },
  ];

  family: Family;

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getFamily();
  }

  menuLabel = "SUMMARY";

  public setMenuLabel(label){
	this.menuLabel = label;
  }

  getFamily() {
    const accession = this.route.snapshot.params['id'];
    this.dfamapi.getFamily(accession).subscribe((data: Family) => {
      this.family = data;
    });
  }

}
