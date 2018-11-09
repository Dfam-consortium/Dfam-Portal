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
    { path: './summary', label: 'Summary' },
    { path: './seed', label: 'Seed' },
    { path: './features', label: 'Features' },
    { path: './model', label: 'Model' },
    { path: './annotations', label: 'Annotations' },
    { path: './relationships', label: 'Relationships' },
    { path: './download', label: 'Download' },
  ];

  family: Family;

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getFamily();
  }

  getFamily() {
    const accession = this.route.snapshot.params['id'];
    this.dfamapi.getFamily(accession).subscribe((data: Family) => {
      this.family = data;
    });
  }

}
