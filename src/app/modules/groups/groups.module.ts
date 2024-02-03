import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core/core.module';
import { GroupFormComponent } from './components/group-form/group-form.component';
import { CreateGroupShellComponent } from './containers/create-group-shell/create-group-shell.component';
import { EditGroupShellComponent } from './containers/edit-group-shell/edit-group-shell.component';
import { GroupShellComponent } from './containers/group-shell/group-shell.component';
import { GroupsListShellComponent } from './containers/groups-list-shell/groups-list-shell.component';
import { GroupsRoutingModule } from './groups-routing.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { TotalsModule } from './modules/totals/totals.module';
import { TransfersModule } from './modules/transfers/transfers.module';

@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [
        GroupsListShellComponent,
        GroupShellComponent,
        CreateGroupShellComponent,
        EditGroupShellComponent,
        GroupFormComponent,
    ],
    imports: [
        GroupsRoutingModule,
        CoreModule,
        ExpensesModule,
        TransfersModule,
        TotalsModule
    ]
})
export class GroupsModule {}
