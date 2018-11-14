// TODO: Create component-level modules and move imports to each

// Angular Imports
import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Http, Response } from '@angular/http'
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Flex-Layout Import
import { FlexLayoutModule } from '@angular/flex-layout'

// Angular-JWT
import { JwtModule } from '@auth0/angular-jwt';

// Material Imports
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTooltipModule} from '@angular/material/tooltip';

// Application Imports
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from "./home/home.component";
import { BrowseComponent } from "./browse/browse.component";
import { AboutComponent } from "./about/about.component";
import { PublicFooterComponent,
         PublicHeaderComponent, PublicLayoutComponent,
         WorkbenchLayoutComponent } from "./shared";
import { LoginModule } from './login/login.module';
import { FamilyComponent } from './family/family.component';
import { FamilySummaryComponent } from './family/family-summary.component';
import { FamilySeedComponent } from './family/family-seed.component';
import { FamilyFeaturesComponent } from './family/family-features.component';
import { FamilyModelComponent } from './family/family-model.component';
import { FamilyAnnotationsComponent } from './family/family-annotations.component';
import { FamilyRelationshipsComponent } from './family/family-relationships.component';
import { FamilyDownloadComponent } from './family/family-download.component';
import { FamilyModelCoverageComponent } from './family/family-model-coverage.component';
import { FamilyModelHitprofileComponent } from './family/family-model-hitprofile.component';
import { FamilyModelLogoComponent } from './family/family-model-logo.component';

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
    FamilyComponent,
    FamilySummaryComponent,
    FamilySeedComponent,
    FamilyFeaturesComponent,
    FamilyModelComponent,
    FamilyAnnotationsComponent,
    FamilyRelationshipsComponent,
    FamilyDownloadComponent,
    FamilyModelCoverageComponent,
    FamilyModelHitprofileComponent,
    FamilyModelLogoComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    HttpModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    LoginModule,
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
