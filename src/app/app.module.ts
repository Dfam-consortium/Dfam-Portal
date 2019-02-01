// TODO: Create component-level modules and move imports to each

// Angular Imports
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Flex-Layout Import
import { FlexLayoutModule } from '@angular/flex-layout';

// Angular-JWT
import { JwtModule } from '@auth0/angular-jwt';

// Material Imports
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';

// Application Imports
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { BrowseComponent } from './browse/browse.component';
import { AboutComponent } from './about/about.component';
import { PublicFooterComponent,
         PublicHeaderComponent, PublicLayoutComponent,
         WorkbenchLayoutComponent } from './shared';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './workbench/user/user.component';
import { FamilyComponent } from './family/family.component';
import { FamilySummaryComponent } from './family/family-summary.component';
import { FamilySeedComponent } from './family/family-seed.component';
import { FamilyFeaturesComponent } from './family/family-features.component';
import { FamilyModelComponent } from './family/family-model.component';
import { FamilyAnnotationsComponent } from './family/family-annotations.component';
import { FamilyRelationshipsComponent } from './family/family-relationships.component';
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
import { LoaderComponent } from './shared/loader/loader.component';
import { ErrorsSnackbarComponent } from './shared/layout/errors-snackbar.component';
import { ClassificationComponent } from './classification/classification.component';
import { ClassificationTreeComponent } from './classification/classification-tree.component';
import { SearchAnnotationsComponent } from './search/search-annotations.component';
import { SearchSequenceResultsComponent } from './search/search-sequence-results.component';
import { HelpComponent } from './help/help.component';
import { HelpSearchComponent } from './help/help-search.component';
import { HelpFamilyComponent } from './help/help-family.component';
import { HelpToolsComponent } from './help/help-tools.component';
import { RepositoryComponent } from './repository/repository.component';
import { RepositoryEntryComponent } from './repository/repository-entry.component';

export function tokenGetter() {
  return localStorage.getItem('access_token');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BrowseComponent,
    AboutComponent,
    PublicFooterComponent,
    PublicLayoutComponent,
    WorkbenchLayoutComponent,
    PublicHeaderComponent,
    LoginComponent,
    UserComponent,
    FamilyComponent,
    FamilySummaryComponent,
    FamilySeedComponent,
    FamilyFeaturesComponent,
    FamilyModelComponent,
    FamilyAnnotationsComponent,
    FamilyRelationshipsComponent,
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
    LoaderComponent,
    ErrorsSnackbarComponent,
    ClassificationComponent,
    ClassificationTreeComponent,
    SearchAnnotationsComponent,
    SearchSequenceResultsComponent,
    HelpComponent,
    HelpSearchComponent,
    HelpFamilyComponent,
    HelpToolsComponent,
    RepositoryComponent,
    RepositoryEntryComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSortModule,
    MatMenuModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    MatToolbarModule,
    BrowserModule,
    // Angular-Jwt for decoding tokens and sending it along through HTTP request auto-magically
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ['localhost:10010'],
        blacklistedRoutes: ['localhost:10010/login']
      }
    }),
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
