import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: 'dfam-family-annotations',
  templateUrl: './family-annotations.component.html',
  styleUrls: ['./family-annotations.component.scss']
})
export class FamilyAnnotationsComponent implements OnInit {

  help = {
    distribution: 'TODO',
  };

  stats: {}[] = [];

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getStatsData();
  }

  getStatsData() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamilyAssemblies(accession).subscribe(data => {
      for (const assembly of data) {
        this.dfamapi.getFamilyAssemblyAnnotationStats(accession, assembly.id)
          .subscribe(stats => {
            stats.hmm.species = assembly.name;
            this.stats.push(stats.hmm);
          });
      }
    });
  }

}
