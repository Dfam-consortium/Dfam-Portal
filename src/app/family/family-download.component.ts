import { Component, OnInit } from '@angular/core';
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

  queuedCount = 0;

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
