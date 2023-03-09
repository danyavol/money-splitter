import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateGroupShellComponent } from './containers/create-group-shell/create-group-shell.component';
import { EditGroupShellComponent } from './containers/edit-group-shell/edit-group-shell.component';
import { CreateExpenseShellComponent } from './modules/expenses/containers/create-expense-shell/create-expense-shell.component';
import { EditExpenseShellComponent } from './modules/expenses/containers/edit-expense-shell/edit-expense-shell.component';
import { GroupShellComponent } from './containers/group-shell/group-shell.component';
import { GroupsListShellComponent } from './containers/groups-list-shell/groups-list-shell.component';

const routes: Routes = [
    {
        path: '',
        component: GroupsListShellComponent
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
    {
        path: ':groupId/new-expense',
        component: CreateExpenseShellComponent
    },
    {
        path: ':groupId/expense/:expenseId',
        component: EditExpenseShellComponent,
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class GroupsRoutingModule { }
