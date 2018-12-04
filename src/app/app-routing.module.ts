import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BrowseComponent } from './browse/browse.component';
import { FamilyComponent } from './family/family.component';
import { FamilySummaryComponent } from './family/family-summary.component';
import { FamilySeedComponent } from './family/family-seed.component';
import { FamilyFeaturesComponent } from './family/family-features.component';
import { FamilyModelComponent } from './family/family-model.component';
import { FamilyAnnotationsComponent } from './family/family-annotations.component';
import { FamilyRelationshipsComponent } from './family/family-relationships.component';
import { FamilyDownloadComponent } from './family/family-download.component';
import { SearchComponent } from './search/search.component';
import { SearchSequenceComponent } from './search/search-sequence.component';
import { SearchAnnotationsComponent } from './search/search-annotations.component';
import { ClassificationComponent } from './classification/classification.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { WorkbenchLayoutComponent } from './shared';
import { UserComponent } from './workbench/user/user.component';
import { PublicLayoutComponent } from './shared';
import { PublicFooterComponent } from './shared';
import { PublicHeaderComponent } from './shared';
import { AuthService } from './shared';

export const PUBLIC_ROUTES: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'search', component: SearchComponent, children: [
    { path: '', redirectTo: 'sequence', pathMatch: 'full' },
    { path: 'sequence', component: SearchSequenceComponent },
    { path: 'annotations', component: SearchAnnotationsComponent },
  ] },
  { path: 'browse', component: BrowseComponent },
  { path: 'family/:id', component: FamilyComponent, children: [
    { path: '', redirectTo: 'summary', pathMatch: 'full' },
    { path: 'summary', component: FamilySummaryComponent },
    { path: 'seed', component: FamilySeedComponent },
    { path: 'features', component: FamilyFeaturesComponent },
    { path: 'model', component: FamilyModelComponent },
    { path: 'annotations', component: FamilyAnnotationsComponent },
    { path: 'relationships', component: FamilyRelationshipsComponent },
    { path: 'download', component: FamilyDownloadComponent },
  ]},
  { path: 'classification', component: ClassificationComponent},
  { path: 'about', component: AboutComponent}
];

export const SECURE_ROUTES: Routes = [
  { path: 'user', component: UserComponent }
];

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent},
  { path: 'register', component: LoginComponent},
  { path: '', component: PublicLayoutComponent, data: { title: 'Public Views' }, children: PUBLIC_ROUTES },
  { path: 'workbench', component: WorkbenchLayoutComponent, canActivate: [AuthService],
    data: { title: 'Workbench Views' }, children: SECURE_ROUTES }
];

//  { path: 'workbench', component: WorkbenchLayoutComponent, canActivate: [Guard],
//    data: { title: 'Workbench Views' }, children: SECURE_ROUTES }


// TO enable tracing:
//  imports: [RouterModule.forRoot(routes, { enableTracing: true })],

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
