import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CurrencyMaskDirective } from 'src/app/core/directives/currency-mask.directive';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { GroupFormComponent } from './components/group-form/group-form.component';
import { CreateGroupShellComponent } from './containers/create-group-shell/create-group-shell.component';
import { EditGroupShellComponent } from './containers/edit-group-shell/edit-group-shell.component';
import { CreateExpenseShellComponent } from './containers/expenses/create-expense-shell/create-expense-shell.component';
import { ExpensesListShellComponent } from './containers/expenses/expenses-list-shell/expenses-list-shell.component';
import { GroupShellComponent } from './containers/group-shell/group-shell.component';
import { GroupsShellComponent } from './containers/groups-shell/groups-shell.component';
import { GroupsRoutingModule } from './groups-routing.module';

@NgModule({
    declarations: [
        GroupsShellComponent,
        CreateGroupShellComponent,
        GroupFormComponent,
        EditGroupShellComponent,
        GroupShellComponent,
        ExpensesListShellComponent,
        CreateExpenseShellComponent,
        ExpenseFormComponent
    ],
    imports: [
        GroupsRoutingModule,
        IonicModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CurrencyMaskDirective
    ],
    providers: [CurrencyMaskDirective],
    exports: [RouterModule],
})
export class GroupsModule {}
