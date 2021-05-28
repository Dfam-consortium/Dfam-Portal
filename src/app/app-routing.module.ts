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
import { SearchSequenceResultsComponent } from './search/search-sequence-results.component';
import { SearchAnnotationsComponent } from './search/search-annotations.component';
import { ClassificationComponent } from './classification/classification.component';
import { ClassificationLayoutComponent } from './classification/classification-layout.component';
import { RepositoryComponent } from './repository/repository.component';
import { DnaTerminiComponent } from './classification/dna-termini.component';
import { PublicationsComponent } from './publications/publications.component';
import { HelpComponent } from './help/help.component';
import { HelpFamilyComponent } from './help/help-family.component';
import { HelpBrowseComponent } from './help/help-browse.component';
import { HelpSearchComponent } from './help/help-search.component';
import { HelpToolsComponent } from './help/help-tools.component';
import { HelpApiComponent } from './help/help-api.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { VerifyComponent } from './login/verify.component';
import { PublicLayoutComponent } from './shared';

export const PUBLIC_ROUTES: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'search', component: SearchComponent, children: [
    { path: '', redirectTo: 'sequence', pathMatch: 'full' },
    { path: 'sequence', component: SearchSequenceComponent },
    { path: 'results/:id', component: SearchSequenceResultsComponent },
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
  { path: 'classification', component: ClassificationLayoutComponent, children: [
    { path: '', redirectTo: 'tree', pathMatch: 'full' },
    { path: 'tree', component: ClassificationComponent },
    { path: 'dna-termini', component: DnaTerminiComponent },
  ]},
  { path: 'repository', component: RepositoryComponent},
  { path: 'publications', component: PublicationsComponent},
  { path: 'help', component: HelpComponent, children: [
    { path: '', redirectTo: 'family', pathMatch: 'full' },
    { path: 'family', component: HelpFamilyComponent },
    { path: 'browse', component: HelpBrowseComponent },
    { path: 'search', component: HelpSearchComponent },
    { path: 'tools', component: HelpToolsComponent },
    { path: 'api', component: HelpApiComponent },
  ] },
  { path: 'about', component: AboutComponent},

  // TODO: Set up a more useful 'not found' page
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent},
  { path: 'register', component: LoginComponent},
  { path: 'verify', component: VerifyComponent },
  { path: 'workbench', loadChildren: () => import('./workbench/workbench.module').then(mod => mod.WorkbenchModule) },
  { path: '', component: PublicLayoutComponent, data: { title: 'Public Views' }, children: PUBLIC_ROUTES },
];

// TO enable tracing:
//  imports: [RouterModule.forRoot(routes, { enableTracing: true })],

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
