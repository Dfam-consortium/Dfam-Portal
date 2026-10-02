import { Component } from '@angular/core';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    standalone: false
})
export class AboutComponent {
  title = 'About Dfam';
  versionData$ = this.dfamapi.versionData$;
  constructor(private dfamapi: DfamAPIService) {}
}
