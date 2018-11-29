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
  assemblies = [];
  karyotypeData: any;

  private _selectedAssembly: string;
  get selectedAssembly(): string {
    return this._selectedAssembly;
  }
  set selectedAssembly(assembly: string) {
    this._selectedAssembly = assembly;
    this.getKaryotypeData(assembly);
  }

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamilyAssemblies(accession).subscribe(data => {
      this.assemblies = data;
      for (const assembly of data) {
        this.dfamapi.getFamilyAssemblyAnnotationStats(accession, assembly.id)
          .subscribe(stats => {
            stats.hmm.species = assembly.name;
            this.stats.push(stats.hmm);
          });
      }
    });
  }

  getKaryotypeData(assembly: string) {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamilyAssemblyKaryotype(accession, assembly).subscribe(data => {
      this.karyotypeData = data;
    });
  }
}
