import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BrowseComponent } from './browse/browse.component';
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
  { path: 'browse', component: BrowseComponent },
  { path: 'browse/:prefix', component: BrowseComponent },
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
  { path: 'workbench', component: WorkbenchLayoutComponent, canActivate: [AuthService], data: { title: 'Workbench Views' }, children: SECURE_ROUTES }
];

//  { path: 'workbench', component: WorkbenchLayoutComponent, canActivate: [Guard], data: { title: 'Workbench Views' }, children: SECURE_ROUTES }


// TO enable tracing:
//  imports: [RouterModule.forRoot(routes, { enableTracing: true })],

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
