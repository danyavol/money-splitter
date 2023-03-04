import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SelectPersonModalComponent } from 'src/app/core/components/select-person-modal/select-person-modal.component';
import { CurrencyMaskDirective } from 'src/app/core/directives/currency-mask.directive';
import { ErrorMessageDirective } from 'src/app/core/directives/error-message.directive';
import { CurrencyPipe } from 'src/app/core/pipes/currency.pipe';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { ExpenseMembersControlComponent } from './components/expense-members-control/expense-members-control.component';
import { GroupFormComponent } from './components/group-form/group-form.component';
import { CreateGroupShellComponent } from './containers/create-group-shell/create-group-shell.component';
import { EditGroupShellComponent } from './containers/edit-group-shell/edit-group-shell.component';
import { CreateExpenseShellComponent } from './containers/expenses/create-expense-shell/create-expense-shell.component';
import { EditExpenseShellComponent } from './containers/expenses/edit-expense-shell/edit-expense-shell.component';
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
        ExpenseFormComponent,
        ExpenseMembersControlComponent,
        EditExpenseShellComponent
    ],
    imports: [
        GroupsRoutingModule,
        IonicModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CurrencyMaskDirective,
        SelectPersonModalComponent,
        ErrorMessageDirective,
        CurrencyPipe
    ],
    providers: [CurrencyMaskDirective],
    exports: [RouterModule],
})
export class GroupsModule {}
