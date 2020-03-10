import { Component, OnInit } from '@angular/core';
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
    seed: 'Download seed alignments[Stockholm]',
    models: 'Download model files (HMM, Consensus[embl], or consensus[fasta])',
    annotations: 'Download per-genome HMM annotation results',
  };

  assemblies: [];

  get hmmUrl() {
    const accession = this.route.parent.snapshot.params['id'];
    return this.dfamapi.getFamilyHmmDownloadUrl(accession);
  }

  get seedUrl() {
    const accession = this.route.parent.snapshot.params['id'];
    return this.dfamapi.getFamilySeedDownloadUrl(accession);
  }

  get emblUrl() {
    const accession = this.route.parent.snapshot.params['id'];
    return this.dfamapi.getFamilyEmblDownloadUrl(accession);
  }

  get fastaUrl() {
    const accession = this.route.parent.snapshot.params['id'];
    return this.dfamapi.getFamilyFastaDownloadUrl(accession);
  }

  annotationsUrl(assembly, nrph) {
    const accession = this.route.parent.snapshot.params['id'];
    return this.dfamapi.getFamilyAssemblyAnnotationsDownloadUrl(accession, assembly, nrph);
  }

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
}
