import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuickSplitShellComponent } from './containers/quick-split-shell/quick-split-shell.component';

const routes: Routes = [
    {
        path: '',
        component: QuickSplitShellComponent
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class QuickSplitRoutingModule { }
