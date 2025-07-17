// TODO: Create component-level modules and move imports to each

// Angular Imports
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Material Imports
import {MatRadioModule} from '@angular/material/radio';
import {MatTabsModule} from '@angular/material/tabs';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';

// Third-party Imports
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

// Application Imports
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { BrowseComponent } from './browse/browse.component';
import { AboutComponent } from './about/about.component';
import { PublicFooterComponent,
         PublicHeaderComponent, PublicLayoutComponent,
         SeqViewComponent } from './shared';
import { LoginComponent } from './login/login.component';
import { FamilyComponent } from './family/family.component';
import { FamilySummaryComponent } from './family/family-summary.component';
import { FamilyBrowserComponent } from './family/family-browser.component';
import { FamilyModelComponent } from './family/family-model.component';
import { FamilyAnnotationsComponent } from './family/family-annotations.component';
import { FamilyDownloadComponent } from './family/family-download.component';
import { FamilyDownloadButtonComponent } from './family/family-download-button.component';
import { FamilyModelCoverageComponent } from './family/family-model-coverage.component';
import { FamilyModelConservationComponent } from './family/family-model-conservation.component';
import { FamilyModelLogoComponent } from './family/family-model-logo.component';
import { SearchComponent } from './search/search.component';
import { SearchSequenceComponent } from './search/search-sequence.component';
import { SearchResultsComponent } from './search/search-results.component';
import { SearchResultsGraphComponent } from './search/search-results-graph.component';
import { SearchResultsAlignmentComponent } from './search/search-results-alignment.component';
import { HelpIconComponent } from './shared/help-icon/help-icon.component';
import { FamilyAnnotationsKaryotypeComponent } from './family/family-annotations-karyotype.component';
import { SearchResultsHitsComponent } from './search/search-results-hits.component';
import { ClassificationLayoutComponent } from './classification/classification-layout.component';
import { ClassificationComponent } from './classification/classification.component';
import { ClassificationTreeComponent } from './classification/classification-tree.component';
import { DnaTerminiComponent } from './classification/dna-termini.component';
import { SearchAnnotationsComponent } from './search/search-annotations.component';
import { SearchSequenceResultsComponent } from './search/search-sequence-results.component';
import { HelpComponent } from './help/help.component';
import { HelpSearchComponent } from './help/help-search.component';
import { HelpFamilyComponent } from './help/help-family.component';
import { HelpBrowseComponent } from './help/help-browse.component';
import { HelpToolsComponent } from './help/help-tools.component';
import { HelpWorkbenchComponent } from './help/help-workbench.component';
import { RepositoryComponent } from './repository/repository.component';
import { RepositoryEntryComponent } from './repository/repository-entry.component';
import { HelpApiComponent } from './help/help-api.component';
import { AssemblyPickerComponent } from './shared/assembly-picker/assembly-picker.component';
import { VerifyComponent } from './login/verify.component';
import { PublicationsComponent } from './publications/publications.component';
import { ChartWrapperComponent } from './chart/chart_wrapper.component'
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { StatsComponent } from './stats/stats.component';

export function tokenGetter() {
  return localStorage.getItem('access_token');
}

// RMH: 7/27/23 : Configure Material ripple effect.  The old site had a much slower default
//                ripple and fade.
import {  MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions } from '@angular/material/core';
const globalRippleConfig: RippleGlobalOptions = {
  disabled: false,
  animation: {
    enterDuration: 600,
    exitDuration: 600
  }
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BrowseComponent,
    AboutComponent,
    PublicFooterComponent,
    PublicLayoutComponent,
    SeqViewComponent,
    PublicHeaderComponent,
    LoginComponent,
    FamilyComponent,
    FamilySummaryComponent,
    FamilyBrowserComponent,
    FamilyModelComponent,
    FamilyAnnotationsComponent,
    FamilyDownloadComponent,
    FamilyDownloadButtonComponent,
    FamilyModelCoverageComponent,
    FamilyModelConservationComponent,
    FamilyModelLogoComponent,
    SearchComponent,
    SearchSequenceComponent,
    SearchResultsComponent,
    SearchResultsGraphComponent,
    SearchResultsAlignmentComponent,
    HelpIconComponent,
    FamilyAnnotationsKaryotypeComponent,
    SearchResultsHitsComponent,
    ClassificationComponent,
    ClassificationTreeComponent,
    SearchAnnotationsComponent,
    SearchSequenceResultsComponent,
    HelpComponent,
    HelpSearchComponent,
    HelpFamilyComponent,
    HelpBrowseComponent,
    HelpToolsComponent,
    RepositoryComponent,
    RepositoryEntryComponent,
    HelpApiComponent,
    AssemblyPickerComponent,
    VerifyComponent,
    DnaTerminiComponent,
    ClassificationLayoutComponent,
    PublicationsComponent,
    HelpWorkbenchComponent,
    ChartWrapperComponent,
    LeaderboardComponent,
    StatsComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatRadioModule,
    MatMenuModule,
    MatTabsModule,
    MatToolbarModule,

    NgxMatSelectSearchModule,

    BrowserModule,
    SharedModule,
    AppRoutingModule,
  ],
  providers: [{provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig}],
  bootstrap: [AppComponent]
})
export class AppModule { }
