import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorsService } from '../services/errors.service';

@Component({
  selector: 'dfam-errors-snackbar',
  template: ``,
})
export class ErrorsSnackbarComponent implements OnInit, OnDestroy {

  errorSubscription;
  errorQueue: string[] = [];
  active = false;

  constructor(
    private snackBar: MatSnackBar,
    private errorsService: ErrorsService,
  ) { }

  ngOnInit() {
    this.errorSubscription = this.errorsService.getErrorObservable().subscribe(error => {
      this.errorQueue.push(error);
      if (!this.active) {
        this.showNext();
      }
    });
  }

  ngOnDestroy() {
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
      this.errorSubscription = null;
    }
  }

  showNext() {
    if (this.errorQueue.length) {
      const errorText = 'Error: ' + this.errorQueue.shift();
      this.snackBar.open(errorText, '', { duration: 4000 })
        .afterDismissed().subscribe(() => {
          this.showNext();
        });
      this.active = true;
    } else {
      this.active = false;
    }
  }

}
