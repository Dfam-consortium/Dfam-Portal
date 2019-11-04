import { Component, OnInit } from '@angular/core';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: 'dfam-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {

  repository = this.dfamapi;

  help = {
    browse: 'Quickly browse/filter families in Dfam.'
  };

  constructor(private dfamapi: DfamAPIService) { }

  ngOnInit() {
  }

}
