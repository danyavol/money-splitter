import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core/core.module';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { ExpenseMembersControlComponent } from './components/expense-members-control/expense-members-control.component';
import { CreateExpenseShellComponent } from './containers/create-expense-shell/create-expense-shell.component';
import { EditExpenseShellComponent } from './containers/edit-expense-shell/edit-expense-shell.component';
import { ExpensesListShellComponent } from './containers/expenses-list-shell/expenses-list-shell.component';

@NgModule({
    declarations: [
        ExpensesListShellComponent,
        CreateExpenseShellComponent,
        EditExpenseShellComponent,
        ExpenseFormComponent,
        ExpenseMembersControlComponent,
    ],
    exports: [
        ExpensesListShellComponent,
        CreateExpenseShellComponent,
        EditExpenseShellComponent
    ],
    imports: [CoreModule],
})
export class ExpensesModule {}
