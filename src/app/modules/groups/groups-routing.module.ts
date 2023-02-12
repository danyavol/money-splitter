import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupsShellComponent } from './containers/groups-shell/groups-shell.component';

const routes: Routes = [
    {
        path: '',
        component: GroupsShellComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class GroupsRoutingModule { }
