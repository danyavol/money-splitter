import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core/core.module';
import { TransferFormComponent } from './components/transfer-form/transfer-form.component';
import { CreateTransferShellComponent } from './containers/create-transfer-shell/create-transfer-shell.component';
import { EditTransferShellComponent } from './containers/edit-transfer-shell/edit-transfer-shell.component';
import { TransfersListShellComponent } from './containers/transfers-list-shell/transfers-list-shell.component';

@NgModule({
    declarations: [
        TransfersListShellComponent,
        CreateTransferShellComponent,
        EditTransferShellComponent,
        TransferFormComponent,
    ],
    exports: [
        TransfersListShellComponent,
        CreateTransferShellComponent,
        EditTransferShellComponent,
    ],
    imports: [CoreModule],
})
export class TransfersModule {}
