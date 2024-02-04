import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AppLayoutComponent } from './modules/layouts/app-layout/app-layout.component';
import { AuthLayoutComponent } from './modules/layouts/auth-layout/auth-layout.component';
import { appLayoutGuard, authLayoutGuard } from './core/guards/layout.guard';

const routes: Routes = [
    {
        path: "app",
        component: AppLayoutComponent,
        canMatch: [appLayoutGuard],
        children: [

            {
                path: 'groups',
                loadChildren: () => import('./modules/groups/groups.module').then(m => m.GroupsModule)
            },
            {
                path: 'people',
                loadChildren: () => import('./modules/people/people.module').then(m => m.PeopleModule)
            },
            {
                path: 'settings',
                loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule)
            },
            {
                path: '**',
                redirectTo: 'groups',
                pathMatch: 'full'
            },
        ]
    },
    {
        path: "auth",
        component: AuthLayoutComponent,
        canMatch: [authLayoutGuard],
        children: [
            {
                path: "",
                loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
            },
            {
                path: '**',
                redirectTo: '',
                pathMatch: 'full'
            },
        ]
    },
    {
        path: '**',
        redirectTo: 'app',
        pathMatch: 'full'
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
