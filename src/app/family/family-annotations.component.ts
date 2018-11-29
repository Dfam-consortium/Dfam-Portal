import { Component, OnInit, Input, HostListener } from '@angular/core';
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
  loadingKaryotype: boolean;
  loadingAnnotationData: boolean;
  karyotypeData: any;
  annotationData: any;

  get hasGiemsa(): boolean {
    if (this.karyotypeData) {
      if (this.karyotypeData.singleton_contigs) {
        if (this.karyotypeData.singleton_contigs[0].giemsa) {
          return true;
        }
      }
    }

    return false;
  }

  private _selectedAssembly: string;
  get selectedAssembly(): string {
    return this._selectedAssembly;
  }
  set selectedAssembly(assembly: string) {
    this._selectedAssembly = assembly;
    this.getKaryotypeData();
  }

  selectedVisualizationType: string = "nrph";

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getData();
  }

  @HostListener('karyotypeclicked', ['$event.detail'])
  onKaryotypeClicked(detail: any) {
    this.getAnnotationData(detail.contig, detail.start, detail.end);
  }

  getData() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamilyAssemblies(accession).subscribe(data => {
      this.assemblies = data;
      if (data.length) {
        this.selectedAssembly = data[0].id;
      }
      for (const assembly of data) {
        this.dfamapi.getFamilyAssemblyAnnotationStats(accession, assembly.id)
          .subscribe(stats => {
            stats.hmm.species = assembly.name;
            this.stats.push(stats.hmm);
          });
      }
    });
  }

  getKaryotypeData() {
    const accession = this.route.parent.snapshot.params['id'];
    this.loadingKaryotype = true;
    this.dfamapi.getFamilyAssemblyKaryotype(accession, this.selectedAssembly).subscribe(data => {
      this.karyotypeData = data;
      this.loadingKaryotype = false;
    });
  }

  getAnnotationData(chrom: string, start: number, end: number) {
    this.loadingAnnotationData = true;

    const accession = this.route.parent.snapshot.params['id'];
    const nrph = this.selectedVisualizationType === 'nrph';

    this.dfamapi.getAnnotations(this.selectedAssembly, chrom, start, end, accession, nrph).subscribe(data => {
      this.annotationData = data;
      this.loadingAnnotationData = false;
    });
  }
}
