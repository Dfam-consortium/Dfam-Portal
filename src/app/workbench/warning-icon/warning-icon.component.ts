import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'workbench-warning-icon',
  templateUrl: './warning-icon.component.html',
  styleUrls: ['./warning-icon.component.scss']
})
export class WarningIconComponent implements OnInit {

  tooltip = "Editing this field will require affected graphs to be recalculated.";

  constructor() { }

  ngOnInit() {
  }

}
