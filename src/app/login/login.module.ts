// Angular
import { BrowserModule } from '@angular/platform-browser';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout'

// Angular Material
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

// Project Imports
import { LoginComponent } from './login.component';
import { UserComponent } from '../workbench/user/user.component';
import { AuthService } from '../shared/services/auth.service';
import { JwtService } from '../shared/services/jwt.service';


@NgModule({
  imports: [
    BrowserModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatTooltipModule,
    MatIconModule,
    MatFormFieldModule,
    RouterModule,
    FlexLayoutModule
  ],
  declarations: [
    LoginComponent,
    UserComponent
  ],
  providers: [
    JwtService,
    AuthService
  ]
})
export class LoginModule {}
