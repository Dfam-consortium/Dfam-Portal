import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

interface Assembly {
  id: string;
  name: string;
}

@Component({
  selector: 'dfam-assembly-picker',
  templateUrl: './assembly-picker.component.html',
  styleUrls: ['./assembly-picker.component.scss']
})
export class AssemblyPickerComponent implements OnInit {

  @Input() assemblies: Assembly[];

  _value: Assembly;
  get value(): Assembly {
    return this._value;
  }
  @Input() set value(value: Assembly) {
    if (this.value !== value) {
      this._value = value;
      this.valueChange.emit(this.value);
    }
  }
  @Output() valueChange = new EventEmitter<Assembly>();

  constructor() { }

  ngOnInit() {
  }

}
