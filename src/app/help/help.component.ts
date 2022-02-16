import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'dfam-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

  navLinks = [
    { path: './family', label: 'Family' },
    { path: './browse', label: 'Browse' },
    { path: './search', label: 'Search' },
    { path: './workbench', label: 'Workbench' },
    { path: './tools', label: 'Tools' },
    { path: './api', label: 'API' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
