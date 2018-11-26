import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
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
