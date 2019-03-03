import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FamilyModelLogoComponent } from './family-model-logo.component';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';
import { SeqViewComponent } from '../shared/seq-view';

@Component({
  selector: 'dfam-family-model',
  templateUrl: './family-model.component.html',
  styleUrls: ['./family-model.component.scss']
})
export class FamilyModelComponent implements OnInit {

  help = {
    consensus: 'The consensus sequence called from the family\'s seed alignment.',
    hmm: 'Hidden Markov Model (HMM) built from the family seed alignment.',
    logo: 'Representation of the per-position residue and indel conservation of the HMM.',
    downloadLogo: 'Download the HMM logo as an image file.',
    genome: 'For each included genome, coverage and conservation statistics are generated based on the HMM',
    conservation: 'Plot showing, for hits above a variety of thresholds, (1) the distribution ' +
      'of hits along the model, (2) the position-specific levels of conservation of those hits, ' +
      'and (3) the position-specific rates of insertion among those hits.',
    nrph: 'Plot showing the distribution across the model for all above-threshold hits, ' +
      'excluding hits preferentially hit by some other model.',
    all: 'Plot showing how all above-threshold matches to dfamseq are distributed across the ' +
      'model. These hits may include many hits that are preferentially hit by some other model.',
    false: 'Plot showing how matches to artificial non-TE sequence are distributed across the model.',
  };

  family;

  get logoUrl() {
    const accession = this.route.parent.snapshot.params['id'];
    return this.dfamapi.getFamilyHmmLogoImageDownloadUrl(accession);
  }

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
    this.getAssemblyData(assembly);
  }
  assemblyData = {};

  conservationData;
  coverageData;

  private _selectedThreshold: string;
  get selectedThreshold(): string {
    return this._selectedThreshold;
  }
  set selectedThreshold(value: string) {
    this._selectedThreshold = value;
    const asm_data = this.assemblyData[this.selectedAssembly];
    if (asm_data) {
      const threshold = asm_data.thresholds.find(t => t.id === this.selectedThreshold);
      if (threshold) {
        this.conservationData = threshold.graph;
      } else {
        this.conservationData = null;
      }
    }
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
      return `Trusted ${assembly_info.hmm_hit_tc} bits`;
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
    this.downloadingLogo = true;
    this.dfamapi.getFamilyHmmLogo(accession).subscribe(l => {
      this.hmmLogo = l;
      this.downloadingLogo = false;
    });
  }

  getAssemblyData(assembly) {
    if (!this.assemblyData[assembly]) {
      const assembly_info = this.assemblies.find(a => a.id === assembly);
      this.assemblyData[assembly] = {
        hmm_fdr: assembly_info.hmm_fdr,
      };

      const accession = this.route.parent.snapshot.params['id'];
      const getConservation = this.dfamapi.getFamilyAssemblyModelConservation(accession, assembly);
      const getCoverage = this.dfamapi.getFamilyAssemblyModelCoverage(accession, assembly);

      return forkJoin(getConservation, getCoverage).subscribe(([mcons, mcov]) => {
        this.assemblyData[assembly].model_conservation = mcons;
        this.assemblyData[assembly].model_coverage = mcov;
        this.coverageData = mcov;
        this._selectedAssembly = assembly;

        const thresholds = this.assemblyData[assembly].thresholds = [];

        if (mcons) {
          mcons.forEach(mcon => {
            const label = `${this.getThresholdTitle(assembly_info, mcon.threshold)} (${mcon.num_seqs})`;

            thresholds.push({
              id: mcon.threshold,
              label,
              graph: {
                points: JSON.parse(mcon.graph),
                max: mcon.max_insert,
              }
            });
          });
          this.selectedThreshold = 'TC';
        }

        if (mcov) {
          Object.keys(mcov).forEach(function(key) {
            mcov[key] = JSON.parse(mcov[key]);
          });
        }
      });
    } else {
      this.selectedThreshold = 'TC';
    }
  }
}
