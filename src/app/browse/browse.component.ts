import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DfamAPIService } from '../shared/dfam-api/dfam-api.service';

@Component({
  selector: '',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent {
  families:any = {};

  search: any = {};

  displayColumns = [ "accession", "name", "classification", "clades", "description", "length" ];
  dataRows = [{"name": "test"}];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private dfamapi:DfamAPIService
  ) { }

  ngOnInit() {
    this.getFamilies();

    const initialKeywords = this.route.snapshot.queryParamMap.get("keywords")
    if (initialKeywords) {
      this.search.keywords = initialKeywords;
    }
  }

  searchApiOptions: any = { };

  searchChanged() {
    this.searchApiOptions.name = this.search.name;
    this.searchApiOptions.classification = this.search.classification;
    this.searchApiOptions.clade = this.search.clade;
    this.searchApiOptions.keywords = this.search.keywords;
    this.paginator.pageIndex = 0;
    this.getFamilies();
  }

  sortChanged(sort: Sort) {
    console.log(sort);
    if (sort.direction) {
      this.searchApiOptions.sort = sort.active + ":" + sort.direction;
    } else {
      delete this.searchApiOptions.sort;
    }
    this.getFamilies();
  }

  pageChanged(event: PageEvent) {
    this.getFamilies();
  }

  getFamilies() {
    this.searchApiOptions.limit = this.paginator.pageSize;
    this.searchApiOptions.start = this.paginator.pageSize * this.paginator.pageIndex;
    this.dfamapi.getFamilies(this.searchApiOptions).subscribe((data: {}) => {
      this.families = data;
    });
  }
}
