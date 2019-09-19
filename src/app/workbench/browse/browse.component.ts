import { Component, OnInit } from '@angular/core';
import { DfamBackendAPIService } from '../../shared/dfam-api/dfam-backend-api.service';

@Component({
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class WorkbenchBrowseComponent implements OnInit {

  repository = this.dfambackendapi;

  constructor(private dfambackendapi: DfamBackendAPIService) { }

  ngOnInit() {
  }

}
