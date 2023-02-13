import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditPersonComponent } from './containers/edit-person/edit-person.component';
import { PeopleShellComponent } from './containers/people-shell/people-shell.component';

const routes: Routes = [
    {
        path: '',
        component: PeopleShellComponent
    },
    {
        path: ':memberId',
        component: EditPersonComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class PeopleRoutingModule { }
