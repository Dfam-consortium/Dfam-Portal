import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

import AlignmentSummaryViewer from 'AlignmentSummaryViewer/dist/AlignmentSummaryViewer';

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

  loading = true;
  _data: any;
  get data(): any {
    return this._data;
  }
  set data(value: any) {
    this._data = value;

    if (value) {
      const container = this.seedContainer.nativeElement;
      const canvas = document.createElement('canvas');
      container.appendChild(canvas);
      this.viewer = new AlignmentSummaryViewer(canvas, container, this.data);
    }
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
    this.dfamapi.getFamilySeedPlot(accession).subscribe(data => {
      this.loading = false;
      this.data = data;
    });
  }
}
