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
import { AuthComponent } from './auth.component';
import { UserComponent } from '../workbench/user/user.component';
import { NoAuthGuard } from './no-auth-guard.service';
import { UserService } from '../shared/services/user.service';
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
    AuthComponent,
    UserComponent
  ],
  providers: [
    NoAuthGuard,
    JwtService,
    UserService
  ]
})
export class AuthModule {}
