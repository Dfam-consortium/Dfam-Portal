import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

declare global {
  interface Window {
    DfamSeedAlignment(): void;
    AlignmentSummaryViewer(canvas, parent, data): void;
  }
}

@Component({
  selector: 'dfam-family-seed',
  templateUrl: './family-seed.component.html',
  styleUrls: ['./family-seed.component.scss']
})
export class FamilySeedComponent implements OnInit {

  help = 'Visualization of the coverage of the family\'s seed alignment.';

  @ViewChild('seedContainer')
  private seedContainer: ElementRef;

  length;
  seeds_count;

  loading: boolean;
  _stockholmData: string;
  get stockholmData(): string {
    return this._stockholmData;
  }
  set stockholmData(value: string) {
    this._stockholmData = value;

    const container = this.seedContainer.nativeElement;
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const seedAlign = new window.DfamSeedAlignment();
    seedAlign.parseStockholm(value);
    this.seeds_count = seedAlign.alignments.length;
    const summary = seedAlign.toAlignmentSummary();
    this.viewer = new window.AlignmentSummaryViewer(canvas, container, summary);
  }

  viewer;

  @HostListener('window:resize')
  onResize() {
    if (this.viewer) {
      this.viewer.resize();
    }
  }

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getLength();
    this.getSeed();
  }

  getLength() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamily(accession).subscribe(f => this.length = f.length);
  }

  getSeed() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamilySeed(accession).subscribe(data => {
      this.stockholmData = data;
      this.loading = false;
    });
  }
}
