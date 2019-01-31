import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dfam-repository-entry',
  templateUrl: './repository-entry.component.html',
  styleUrls: ['./repository-entry.component.scss']
})
export class RepositoryEntryComponent implements OnInit {

  @Input() data;

  constructor() { }

  ngOnInit() {
  }

}
