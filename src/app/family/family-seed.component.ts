import { Component, OnInit, OnDestroy, Input, ElementRef, ViewChild } from '@angular/core';
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
export class FamilySeedComponent implements OnInit, OnDestroy {

  @ViewChild('seedContainer')
  private seedContainer: ElementRef;

  length;

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
    const summary = seedAlign.toAlignmentSummary();
    this.viewer = new window.AlignmentSummaryViewer(canvas, container, summary);
  }

  viewer;

  resizeHandler() {
    if (this.viewer) {
      this.viewer.resize();
    }
  }

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    window.addEventListener('resize', this.resizeHandler.bind(this));
    this.getLength();
    this.getSeed();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler.bind(this));
  }

  getLength() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamily(accession).subscribe(f => this.length = f.length);
  }

  getSeed() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamilySeed(accession).subscribe(s => this.stockholmData = s);
  }
}
