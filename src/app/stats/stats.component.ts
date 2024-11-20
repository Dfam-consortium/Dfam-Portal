import { Component, OnInit } from '@angular/core';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: 'dfam-stats',
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent implements OnInit {

  constructor(
    private dfamapi: DfamAPIService,
  ) {}

  totalFamilies: number;
  curatedFamilies: number;
  coveredSpecies: number;

  ngOnInit() {
      this.dfamapi.getVersionData().subscribe(data => {
      this.totalFamilies = data.total_families
      this.curatedFamilies = data.curated_families
      this.coveredSpecies = data.species
    })
  }
}
