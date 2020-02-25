import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { MatTableDataSource } from '@angular/material/table';

import { AuthService } from '../../shared/services/auth.service';
import { DfamBackendAPIService } from '../../shared/dfam-api/dfam-backend-api.service';

@Component({
  selector: 'dfam-workbench-uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.scss']
})
export class WorkbenchUploadsComponent implements AfterViewInit {

  loading = true;
  uploads = [];
  displayColumns = [];
  editableStatus = false;

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
      } else if (user.role === 'curator') {
        this.displayColumns =  ['expander', 'uploaded_by', 'file_name', 'upload_date', 'status'];
        this.editableStatus = true;
      } else {
        this.router.navigate(['/workbench']);
      }
    });
  }

  ngAfterViewInit() {
    this.getUploads();
  }

  getUploads() {
    this.dfambackendapi.getUploads().subscribe(data => {
      data.forEach(upload => upload.show_notes = false);
      this.uploads = data;
      this.loading = false;
    });
  }

  changeUploadStatus(upload, event) {
    let newStatus = event.target.value;
    upload.status = newStatus;
    this.dfambackendapi.patchUpload(upload.id, { status: newStatus }).subscribe();
  }
}
