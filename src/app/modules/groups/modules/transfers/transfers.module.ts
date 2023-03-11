import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core/core.module';
import { TransfersListShellComponent } from './containers/transfers-list-shell/transfers-list-shell.component';

@NgModule({
    declarations: [
        TransfersListShellComponent,
    ],
    exports: [
        TransfersListShellComponent,
    ],
    imports: [CoreModule],
})
export class TransfersModule {}
