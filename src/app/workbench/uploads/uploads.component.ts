import { Component, AfterViewInit, ViewChild, OnInit, OnDestroy, HostListener, Injectable } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { CanDeactivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Subscription, Observable } from 'rxjs';

import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { FlowDirective } from '@flowjs/ngx-flow';

import { AuthService } from '../../shared/services/auth.service';
import { DfamBackendAPIService } from '../../shared/dfam-api/dfam-backend-api.service';

import { UploadCloseDialogComponent } from './upload-close-dialog.component';

enum UploaderState { NoFileSelected, FileSelected, InProgress, Error, Succeeded }

@Component({
  selector: 'dfam-workbench-uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.scss']
})
export class WorkbenchUploadsComponent implements AfterViewInit, OnInit, OnDestroy {

  loading = true;
  uploads = [];
  displayColumns = [];
  editableStatus = false;

  flowConfig;
  @ViewChild('flow', { static: false }) flow: FlowDirective;
  flowSubscription: Subscription;

  UploaderState = UploaderState;
  uploaderState: UploaderState = UploaderState.NoFileSelected;
  get canSelectFile(): boolean {
    return this.uploaderState !== UploaderState.InProgress;
  }
  get canStartUpload(): boolean {
    return this.formData.valid && this.uploaderState === UploaderState.FileSelected && this.uploadTermsAgreed;
  }

  formData = new UntypedFormGroup({
    'dataFormat': new UntypedFormControl("", Validators.required),
    'species': new UntypedFormControl("", Validators.required),
    'assembly': new UntypedFormControl("", Validators.required),
    'discoveryMethod': new UntypedFormControl(""),
    'curationMethod': new UntypedFormControl(""),
    'notes': new UntypedFormControl(""),
  });
  selectedFile: File;
  uploadTermsAgreed: boolean;

  uploadProgress: number;
  uploadError: string;
  statusText: string;

  constructor(
    private router: Router,
    private dfambackendapi: DfamBackendAPIService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.displayColumns = [];
      this.editableStatus = false;

      if (user.role === 'submitter') {
        this.displayColumns =  ['expander', 'file_name', 'upload_date', 'status'];
      } else if (user.role === 'curator' || user.role === 'administrator') {
        this.displayColumns =  ['expander', 'uploaded_by', 'file_name', 'upload_date', 'status'];
        this.editableStatus = true;
      } else {
        this.router.navigate(['/workbench']);
      }
    });

    this.formData.statusChanges.forEach(s => this.updateStatusText());

    this.flowConfig = this.dfambackendapi.getFlowConfig();
    this.flowConfig.query = (_file, _chunk, isTest) => isTest ? undefined : { notes: this.generateNotes() };
  }

  ngAfterViewInit() {
    this.getUploads();
    this.flowSubscription = this.flow.events$.subscribe(e => this.handleFlowEvent(e));
  }

  ngOnDestroy() {
    this.flowSubscription.unsubscribe();
  }

  // Warn on unsaved changes when attempting to leave the page
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e) {
    if (this.uploaderState === UploaderState.InProgress) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    } else {
      delete e['returnValue'];
      return undefined;
    }
  }


  getUploads() {
    this.dfambackendapi.getUploads().subscribe(data => {
      data.forEach(upload => upload.show_notes = false);
      this.uploads = data;
      this.loading = false;
    });
  }

  changeUploadStatus(upload, event) {
    const newStatus = event.target.value;
    upload.status = newStatus;
    this.dfambackendapi.patchUpload(upload.id, { status: newStatus }).subscribe();
  }

  updateStatusText() {
    if (!this.formData.valid) {
      this.statusText = 'Please include all required information.';
    } else if (this.uploaderState === UploaderState.NoFileSelected) {
      this.statusText = 'Ready to choose a file.';
    } else if (this.uploaderState === UploaderState.FileSelected) {
      this.statusText = 'Ready to upload.';
    } else if (this.uploaderState === UploaderState.InProgress) {
      this.statusText = 'Uploading: ' + (100 * this.uploadProgress).toFixed(0) + '%';
    } else if (this.uploaderState === UploaderState.Error) {
      this.statusText = 'Error: ' + this.uploadError;
    } else if (this.uploaderState === UploaderState.Succeeded) {
      this.statusText = 'File uploaded successfully.';
    } else {
      throw new Error('updateStatusText: unexpected UploaderState: ' + this.uploaderState);
    }
  }

  generateNotes () {
    return `TE Family Format: ${this.formData.controls.dataFormat.value}
Species: ${this.formData.controls.species.value}
Assembly: ${this.formData.controls.assembly.value}
Discovery Method: ${this.formData.controls.discoveryMethod.value}
Curation Method: ${this.formData.controls.curationMethod.value}

Additional Notes:
${this.formData.controls.notes.value}`
  }

  handleFlowEvent(event) {
    const type = event.type;
    const detail = event.event;

    if (type === 'fileAdded') {
      this.selectedFile = detail[0];
      this.uploaderState = UploaderState.FileSelected;
    } else if (type === 'fileProgress') {
      this.uploadProgress = +detail[0].progress();
      this.uploaderState = UploaderState.InProgress;
    } else if (type === 'fileSuccess') {
      this.uploaderState = UploaderState.Succeeded;
      this.getUploads();
    } else if (type === 'fileError') {
      // The API response is in detail[1]. Hopefully it's JSON.
      let responseObj;
      try {
        responseObj = JSON.parse(detail[1]);
      } catch {
        responseObj = { message: undefined };
      }

      if (responseObj.message) {
        this.uploadError = responseObj.message;
      } else {
        this.uploadError = 'Unexpected response from server.';
      }

      this.uploaderState = UploaderState.Error;
      this.getUploads();
    } else {
      // We don't care about other events, and we want to cancel
      // the rest of this function (e.g. updating the status text)
      return;
    }

    this.updateStatusText();
  }
}

@Injectable()
export class CanDeactivateWorkbenchUploadsComponent implements CanDeactivate<WorkbenchUploadsComponent> {
  constructor(private dialog: MatDialog) { }

  canDeactivate(
    component: WorkbenchUploadsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot,
  ): Observable<boolean> | boolean {
    if (component.uploaderState === UploaderState.InProgress) {
      const dialogRef = this.dialog.open(UploadCloseDialogComponent);
      return dialogRef.afterClosed();
    } else {
      return true;
    }
  }
}
