import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'groups',
        pathMatch: 'full'
    },
    {
        path: 'groups',
        loadChildren: () => import('./modules/groups/groups.module').then(m => m.GroupsModule)
    },
    {
        path: 'people',
        loadChildren: () => import('./modules/people/people.module').then(m => m.PeopleModule)
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
