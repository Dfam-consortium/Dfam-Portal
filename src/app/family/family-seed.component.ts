import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { fromEvent, Unsubscribable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

import AlignmentSummaryViewer from 'AlignmentSummaryViewer/dist/AlignmentSummaryViewer';

@Component({
  selector: 'dfam-family-seed',
  templateUrl: './family-seed.component.html',
  styleUrls: ['./family-seed.component.scss']
})
export class FamilySeedComponent implements OnInit, AfterViewInit, OnDestroy {

  help = 'Coverage, and quality visualization for this family\'s seed alignment.';

  @ViewChild('seedContainer')
  private seedContainer: ElementRef;

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

  resizeSubscription: Unsubscribable;

  constructor(
    private dfamapi: DfamAPIService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(300))
      .subscribe(e => { if (this.viewer) { this.viewer.resize(); } });
  }

  ngAfterViewInit() {
    this.getSeed();
  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
  }

  getSeed() {
    const accession = this.route.parent.snapshot.params['id'];
    this.dfamapi.getFamilySeedPlot(accession).subscribe(data => {
      this.loading = false;
      this.data = data;
    });
  }
}
