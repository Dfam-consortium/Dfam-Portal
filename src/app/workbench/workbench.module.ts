import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

// Material Imports
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { NgxFlowModule, FlowInjectionToken } from '@flowjs/ngx-flow';
//import Flow from '@flowjs/flow.js'; 
import * as Flow from '@flowjs/flow.js'; 

import { WorkbenchRoutingModule } from './workbench-routing.module';

import { WorkbenchLayoutComponent } from './layout/workbench-layout.component';
import { WorkbenchUserComponent } from './user/user.component';
import { WorkbenchUsersComponent } from './users/users.component';
import { WorkbenchUploadsComponent } from './uploads/uploads.component';
import { WorkbenchBrowseComponent } from './browse/browse.component';
import { WorkbenchFamilyComponent } from './family/family.component';
import { FamilyClassificationDialogComponent } from './family/family-classification-dialog.component';
import { WarningIconComponent } from './warning-icon/warning-icon.component';
import { FamilyCloseDialogComponent } from './family/family-close-dialog.component';
import { FamilyHelpDialogComponent } from './family/family-help-dialog.component';
import { UploadCloseDialogComponent } from './uploads/upload-close-dialog.component';


@NgModule({
  declarations: [
    WorkbenchLayoutComponent,
    WorkbenchUserComponent,
    WorkbenchUsersComponent,
    WorkbenchUploadsComponent,
    WorkbenchBrowseComponent,
    WorkbenchFamilyComponent,
    FamilyClassificationDialogComponent,
    WarningIconComponent,
    FamilyCloseDialogComponent,
    FamilyHelpDialogComponent,
    UploadCloseDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    SharedModule,

    NgxFlowModule,

    MatDialogModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatTreeModule,
    MatProgressBarModule,

    WorkbenchRoutingModule,
  ],
  providers: [
    { provide: FlowInjectionToken, useValue: Flow },
  ],
})
export class WorkbenchModule { }
