import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthShellComponent } from './containers/auth-shell/auth-shell.component';
import { SinginEmailComponent } from './containers/singin-email/singin-email.component';

const routes: Routes = [
    {
        path: '',
        component: AuthShellComponent,
    },
    {
        path: 'email',
        component: SinginEmailComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class AuthRoutingModule { }
