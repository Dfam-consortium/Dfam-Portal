import { ClipboardModule } from '@angular/cdk/clipboard';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { Subscriber } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';

export interface DialogData {
    url: string;
    sub: Subscriber<any>;
}

@Component({
    templateUrl: './download-dialog.component.html',
    imports: [MatDialogModule, ClipboardModule, MatButtonModule, MatIconModule, MatCardModule],
    standalone: true
  })
export class DownloadDialogComponent implements OnInit {

    public fullUrl:string;

    constructor(
        public dialogRef: MatDialogRef<DownloadDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {}

    ngOnInit() {
        this.fullUrl = `www.dfam.org${this.data.url}`
    }
    
    onClose() {
        this.dialogRef.close();
    }
    onCancel() {
        this.data.sub.unsubscribe()
        this.onClose();
    }
}