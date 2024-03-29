import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReplaySubject } from 'rxjs';

interface Assembly {
  id: string;
  name: string;
  displayName?: string;
}

@Component({
  selector: 'dfam-assembly-picker',
  templateUrl: './assembly-picker.component.html',
  styleUrls: ['./assembly-picker.component.scss']
})
export class AssemblyPickerComponent implements OnInit {

  _assemblies: Assembly[];
  get assemblies() {
    return this._assemblies;
  }

  @Input() set assemblies(value: Assembly[]) {
    if (this.assemblies !== value) {
      this._assemblies = Array.from(value);
      this._assemblies.forEach(a => {
        a.displayName = a.name;
        if (this.showIds) {
          a.displayName += ` [${a.id}]`;
        }
      });
      this.updateFilter(this.lastFilter);
    }
  }

  @Input() showIds = true;
  @Input() placeholder = 'Assembly';

  lastFilter?: string;

  filteredAssemblies: ReplaySubject<Assembly[]> = new ReplaySubject(1);

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
    this.updateFilter('');
  }

  updateFilter(term) {
    if (!this.assemblies) { return; }

    this.lastFilter = term;
    if (term) {
      term = term.toLowerCase();
      this.filteredAssemblies.next(this.assemblies.filter(a => a.name.toLowerCase().indexOf(term) !== -1 ||
          a.id.toLowerCase().indexOf(term) !== -1));
    } else {
      this.filteredAssemblies.next(this.assemblies);
    }
  }

}
