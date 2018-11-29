import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

declare global {
  interface Window {
    saveAs( blob: Blob|File|string, filename?: string, options?: any );
  }
}

@Component({
  selector: 'dfam-family-download',
  templateUrl: './family-download.component.html',
  styleUrls: ['./family-download.component.scss']
})
export class FamilyDownloadComponent implements OnInit {

  help = {
    models: 'Download model files (HMM or Stockholm seed alignments)',
    annotations: 'Download per-genome annotation results',
  };

  assemblies: [];

  queuedCount: number = 0;

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getAssemblies();
  }

  getAssemblies() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamilyAssemblies(accession).subscribe(as => {
      this.assemblies = as;
    });
  }

  downloadHmm() {
    const accession = this.route.parent.snapshot.params['id'];
    this.download(this.dfamapi.getFamilyHmm(accession), accession + '.hmm');
  }

  downloadSeed() {
    const accession = this.route.parent.snapshot.params['id'];
    this.download(this.dfamapi.getFamilySeed(accession), accession + '.stk');
  }

  downloadAssemblyAnnotations(assembly: string, nrph: boolean) {
    const accession = this.route.parent.snapshot.params['id'];
    const suffix = nrph ? 'nr-hits' : 'hits';
    this.download(
      this.dfamapi.getFamilyAssemblyAnnotations(accession, assembly, nrph),
      `${accession}.${assembly}.${suffix}.tsv`,
    );
  }

  download(observable: Observable<any>, filename: string) {
    this.queuedCount += 1;
    observable.subscribe(data => {
      const blob = new Blob([data], { type: 'text/plain' });
      window.saveAs(blob, filename);
      this.queuedCount -= 1;
    });
  }

}
