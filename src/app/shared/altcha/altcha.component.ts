
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, ViewChild, forwardRef, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, ValidationErrors } from '@angular/forms';

import 'altcha';

@Component({
  selector: 'dfam-altcha',
  standalone: true,
  templateUrl: './altcha.component.html',
  styleUrls: ['./altcha.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AltchaComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AltchaComponent),
      multi: true
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AltchaComponent implements ControlValueAccessor, Validator, AfterViewInit {
  @ViewChild('altchaWidget', { static: true }) altchaWidget!: ElementRef;
  @Output() notify = new EventEmitter<string>();
  value = '';
  onChange: CallableFunction = () => undefined;
  onTouched: CallableFunction = () => undefined;

  ngAfterViewInit(): void {
    const el = this.altchaWidget.nativeElement as HTMLElement;
    el.addEventListener('statechange', (ev) => {
      const { detail } = ev as CustomEvent;
      if (detail) {
        const { payload, state } = detail;
        this.onStateChange(state, payload);
      }
    });
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: CallableFunction): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: CallableFunction): void {
    this.onTouched = fn;
  }

  validate(): ValidationErrors | null {
    if (!this.value) {
      return { required: true };
    }
    return null;
  }

  onStateChange(state: 'unverified' | 'verifying' | 'verified' | 'error', payload = '') {
    this.value = state === 'verified' ? payload : '';
    this.onChange(this.value);
    this.notify.emit(this.value);
    this.onTouched();
  }
}
