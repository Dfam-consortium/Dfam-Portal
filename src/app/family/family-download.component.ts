import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: 'dfam-family-download',
  templateUrl: './family-download.component.html',
  styleUrls: ['./family-download.component.scss']
})
export class FamilyDownloadComponent implements OnInit {

  help = {
    models: "Download model files (HMM or Stockholm seed alignments)",
    annotations: "Download per-genome annotation results",
  };

  assemblies: [];

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
    observable.subscribe(data => {
      const blob = new Blob([data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.rel = 'noopener';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();
    });
  }

}
