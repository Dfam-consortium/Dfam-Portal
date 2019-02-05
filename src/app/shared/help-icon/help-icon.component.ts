import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dfam-help-icon',
  templateUrl: './help-icon.component.html',
  styleUrls: ['./help-icon.component.scss']
})
export class HelpIconComponent implements OnInit {

  @Input() tooltip: string;
  @Input() link: string;

  constructor() { }

  ngOnInit() {
  }

}
