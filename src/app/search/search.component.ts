import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'dfam-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    standalone: false
})
export class SearchComponent implements OnInit {

  navLinks = [
    { path: './sequence', label: 'Sequence' },
    { path: './annotations', label: 'Annotations' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
