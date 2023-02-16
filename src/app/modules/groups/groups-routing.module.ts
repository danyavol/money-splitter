import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateGroupShellComponent } from './containers/create-group-shell/create-group-shell.component';
import { EditGroupShellComponent } from './containers/edit-group-shell/edit-group-shell.component';
import { GroupShellComponent } from './containers/group-shell/group-shell.component';
import { GroupsShellComponent } from './containers/groups-shell/groups-shell.component';

const routes: Routes = [
    {
        path: '',
        component: GroupsShellComponent
    },
    {
        path: 'new',
        component: CreateGroupShellComponent
    },
    {
        path: ':groupId',
        component: GroupShellComponent
    },
    {
        path: ':groupId/edit',
        component: EditGroupShellComponent
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class GroupsRoutingModule { }
