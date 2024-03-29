import { Component, OnInit, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: 'dfam-family-annotations',
  templateUrl: './family-annotations.component.html',
  styleUrls: ['./family-annotations.component.scss']
})
export class FamilyAnnotationsComponent implements OnInit {

  help = {
    overview: 'Count, hit length, and Kimura divergence statistics for this family.',
    distribution: 'Interactive heat map of hits to genome assemblies included in Dfam',
  };

  assemblies: [];
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
    if (this.selectedAssembly !== assembly) {
      this.annotationData = null;
    }
    this._selectedAssembly = assembly;
    this.getKaryotypeData();
  }

  selectedVisualizationType = 'nrph';

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
    this.dfamapi.getFamilyAnnotationStats(accession).subscribe(data => {
      this.assemblies = data;
      if (data.length) {
        this.selectedAssembly = data[0].id;
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
      this.annotationData.title = `${chrom}:${start}-${end}`;
      this.loadingAnnotationData = false;
    });
  }

  getAlignment(hit): Observable<any> {
    return this.dfamapi.getAlignment(this.selectedAssembly, hit.sequence, hit.seq_start, hit.seq_end, hit.accession);
  }
}
