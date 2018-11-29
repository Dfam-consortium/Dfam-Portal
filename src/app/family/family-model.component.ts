import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FamilyModelLogoComponent } from './family-model-logo.component';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

declare global {
  interface Window {
    dfamCoveragePlot(target: any, data: any): any;
    dfamConservationPlot(target: any, data: any): any;
  }
}

@Component({
  selector: 'dfam-family-model',
  templateUrl: './family-model.component.html',
  styleUrls: ['./family-model.component.scss']
})
export class FamilyModelComponent implements OnInit {

  help = {
    details: 'Details of both the Hidden Markov Model (HMM) and Consensus model for this family',
    logo: 'Representation of the per-position residue and indel conservation of the HMM. Each position in the model is represented by a stack of letters, with the stack height indicating the information content of the position, and rate and expected length of insertions after each position shown in the fields below each stack.',
    downloadLogo: 'Download the HMM logo as an image file.',
    genome: 'For each included genome, coverage and conservation statistics are generated based on the HMM',
    conservation: 'Plot showing, for hits above a variety of thresholds, (1) the distribution of hits along the model, (2) the position-specific levels of conservation of those hits, and (3) the position-specific rates of insertion among those hits.  For a selected threshold, the purple line shows, for each model position, the fraction of all hits that have a match to that position, considering only RPH-filtered hits (hits for which this model is deemed to fit the sequence better than any other Dfam model).  Among RPH-filtered hits, the green line shows, for each position, the average percent identity for a window of length 7 around the position. The grey line shows the number of insertions among those hits. In the threshold selection box, the number in parentheses shows the number of hits meeting the given threshold.',
    nrph: 'Plot showing the distribution across the model for all above-threshold hits, after removing redundant profile hits (RPHs: hits to other Dfam profile HMMs that are deemed to  be of higher quality than the corresponding hit to this model).',
    all: 'Plot showing how all above-threshold matches to dfamseq are distributed across the model. These hits may include many hits that are preferentially hit by some other model.',
    false: 'Plot showing how matches to artificial non-TE sequence are distributed across the model.',
  };

  family;

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute
  ) { }

  hmmLogo: string;
  downloadingLogo: boolean;

  assemblies = [];

  private _selectedAssembly: string;
  get selectedAssembly(): string {
    return this._selectedAssembly;
  }
  set selectedAssembly(assembly: string) {
    this._selectedAssembly = assembly;
    this.getAssemblyData(assembly);
  }
  assemblyData = {};

  thresholds: {id: string; label: string; graph: {}}[];

  conservationData;

  private _selectedThreshold: string;
  get selectedThreshold(): string {
    return this._selectedThreshold;
  }
  set selectedThreshold(value: string) {
    this._selectedThreshold = value;
    const conservation = this.assemblyData[this.selectedAssembly].model_conservation;
    const graph_data = this.thresholds.find(t => t.id === this.selectedThreshold).graph;
    this.conservationData = graph_data;
  }

  @ViewChild(FamilyModelLogoComponent) logoComponent: FamilyModelLogoComponent;

  ngOnInit() {
    this.getFamily();
    this.getModelData();
  }

  @HostListener('model_position', ['$event.detail'])
  onModelPosition(position: number) {
    this.logoComponent.scrollTo(position);
    this.logoComponent.logo.nativeElement.scrollIntoView();
  }

  getThresholdTitle(assembly_info: any, id: string) {
    if (id === 'GA') {
      return `Gathering ${assembly_info.hmm_hit_ga} bits`;
    } else if (id === 'TC') {
      return `Trusted ${assembly_info.hmm_hit_ga} bits`;
    } else if (['2', '4', '8', '16'].indexOf(id) !== -1) {
      return `E-value 1.0e-${id}`;
    } else {
      return id;
    }
  }

  getFamily() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamily(accession).subscribe(data => {
      this.family = data;
    });
  }

  getModelData() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamilyAssemblies(accession).subscribe(as => {
      this.assemblies = as;
      if (as.length) {
        this.selectedAssembly = as[0].id;
      }
    });
    this.dfamapi.getFamilyHmmLogo(accession).subscribe(l => this.hmmLogo = l);
  }

  getAssemblyData(assembly) {
    if (!this.assemblyData[assembly]) {
      const assembly_info = this.assemblies.find(a => a.id === assembly);
      this.assemblyData[assembly] = {
        hmm_fdr: assembly_info.hmm_fdr,
      };

      const accession = this.route.parent.snapshot.params['id'];
      this.dfamapi.getFamilyAssemblyModelConservation(accession, assembly).subscribe(mcons => {
        this.assemblyData[assembly].model_conservation = mcons;
        this.thresholds = [];
        mcons.forEach(mcon => {
          const label = `${this.getThresholdTitle(assembly_info, mcon.threshold)} (${mcon.num_seqs})`;

          this.thresholds.push({
            id: mcon.threshold,
            label,
            graph: {
              points: JSON.parse(mcon.graph),
              max: mcon.max_insert,
            }
          });
        });
        this.selectedThreshold = 'TC';
      });
      this.dfamapi.getFamilyAssemblyModelCoverage(accession, assembly).subscribe(mcov => {
        Object.keys(mcov).forEach(function(key) {
          mcov[key] = JSON.parse(mcov[key]);
        });
        this.assemblyData[assembly].model_coverage = mcov;
      });
    } else {
      this.selectedThreshold = 'TC';
    }
  }

  onDownloadLogo() {
    this.downloadingLogo = true;
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamilyHmmLogoImage(accession).subscribe(data => {
      const blob = new Blob([data], { type: 'image/png' });
      window.saveAs(blob, accession + '.png');
      this.downloadingLogo = false;
    });
  }
}
