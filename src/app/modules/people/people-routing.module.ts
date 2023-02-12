import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PeopleShellComponent } from './containers/people-shell/people-shell.component';

const routes: Routes = [
    {
        path: '',
        component: PeopleShellComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class PeopleRoutingModule { }
