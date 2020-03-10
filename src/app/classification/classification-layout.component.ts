import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'dfam-classification-layout',
  templateUrl: './classification-layout.component.html',
  styleUrls: ['./classification-layout.component.scss']
})
export class ClassificationLayoutComponent implements OnInit {

  navLinks = [
    { path: './tree', label: 'CLASSIFICATION' },
    { path: './dna-termini', label: 'DNA TRANSPOSON TERMINI' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
