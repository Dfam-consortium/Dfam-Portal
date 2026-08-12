
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, ViewChild, forwardRef, AfterViewInit, EventEmitter, Input, Output, Inject, Injectable } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, ValidationErrors } from '@angular/forms';
import { DOCUMENT } from '@angular/common';

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
@Injectable({ providedIn: 'root' })
export class AltchaComponent implements ControlValueAccessor, Validator, AfterViewInit {

  constructor(@Inject(DOCUMENT) private document: Document) {}

  @ViewChild('altchaWidget', { static: true }) altchaWidget!: ElementRef;
  @Output() notify = new EventEmitter<string>();
  value = '';
  onChange: CallableFunction = () => undefined;
  onTouched: CallableFunction = () => undefined;
  // Defaults to the public Dfam API's challenge endpoint. The registration form
  // overrides this to point at the backend API, which signs its challenges with
  // a different key and expires them; see Dfam-Backend-API/service/AltchaService.js.
  @Input() challengeurl = this.document.location.origin + "/api/altcha";

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

    if (this.pendingSolve && state !== 'verifying') {
      const resolve = this.pendingSolve;
      this.pendingSolve = null;
      resolve(this.value);
    }
  }

  private pendingSolve: ((payload: string) => void) | null = null;

  // Discards the current solution and solves a fresh challenge, resolving with
  // the new payload (or '' if it could not be solved).
  //
  // The widget refetches on its own when a challenge expires while the page is
  // open, so this is only needed for the narrow race where a challenge lapses
  // between being solved and the form being submitted, and the server rejects
  // the payload as expired.
  solveAgain(): Promise<string> {
    const el = this.altchaWidget.nativeElement as HTMLElement & {
      reset: () => void;
      verify: () => Promise<void>;
    };

    return new Promise<string>((resolve) => {
      this.pendingSolve = resolve;
      el.reset();
      el.verify().catch(() => {
        if (this.pendingSolve) {
          this.pendingSolve = null;
          resolve('');
        }
      });
    });
  }
}
