import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

// Material Imports
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTreeModule } from '@angular/material/tree';
import { MatDialogModule } from '@angular/material/dialog';

import { WorkbenchRoutingModule } from './workbench-routing.module';

import { WorkbenchLayoutComponent } from './layout/workbench-layout.component';
import { WorkbenchUserComponent } from './user/user.component';
import { WorkbenchBrowseComponent } from './browse/browse.component';
import { WorkbenchFamilyComponent } from './family/family.component';
import { FamilyClassificationDialogComponent } from './family/family-classification-dialog.component';


@NgModule({
  declarations: [
    WorkbenchLayoutComponent,
    WorkbenchUserComponent,
    WorkbenchBrowseComponent,
    WorkbenchFamilyComponent,
    FamilyClassificationDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    SharedModule,

    MatDialogModule,
    MatSidenavModule,
    MatListModule,
    MatTreeModule,

    WorkbenchRoutingModule,
  ],
  entryComponents: [
    FamilyClassificationDialogComponent,
  ],
})
export class WorkbenchModule { }
