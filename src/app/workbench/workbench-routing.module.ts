import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkbenchLayoutComponent } from './layout/workbench-layout.component';
import { WorkbenchUserComponent } from './user/user.component';
import { WorkbenchBrowseComponent } from './browse/browse.component';
import { WorkbenchFamilyComponent, CanDeactivateWorkbenchFamilyComponent } from './family/family.component';

import { AuthService } from '../shared';

const SECURE_ROUTES: Routes = [
  { path: 'user', component: WorkbenchUserComponent },
  { path: 'browse', component: WorkbenchBrowseComponent },
  { path: 'family/:id', component: WorkbenchFamilyComponent,
    canDeactivate: [CanDeactivateWorkbenchFamilyComponent] },
];

const routes: Routes = [
  { path: '', redirectTo: 'user', pathMatch: 'full' },
  { path: '', component: WorkbenchLayoutComponent, canActivate: [AuthService],
    data: { title: 'Workbench Views' }, children: SECURE_ROUTES },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CanDeactivateWorkbenchFamilyComponent],
})
export class WorkbenchRoutingModule { }
