import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { QuickSplitRoutingModule } from './quick-split-routing.module';
import { QuickSplitShellComponent } from './containers/quick-split-shell/quick-split-shell.component';

@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [QuickSplitShellComponent],
    imports: [
        QuickSplitRoutingModule,
    ]
})
export class QuickSplitModule {}
