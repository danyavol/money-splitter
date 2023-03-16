import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core/core.module';
import { TotalsDetailedFormShellComponent } from './containers/totals-detailed-form-shell/totals-detailed-form-shell.component';
import { TotalsFormShellComponent } from './containers/totals-form-shell/totals-form-shell.component';
import { TotalsShellComponent } from './containers/totals-shell/totals-shell.component';

@NgModule({
    declarations: [
        TotalsShellComponent,
        TotalsFormShellComponent,
        TotalsDetailedFormShellComponent,
    ],
    imports: [
        CoreModule,
    ],
    exports: [
        TotalsShellComponent
    ]
})
export class TotalsModule {}
