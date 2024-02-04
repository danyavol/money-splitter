import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthShellComponent } from './containers/auth-shell/auth-shell.component';
import { AuthRoutingModule } from './auth-routing.module';
import { IonicModule } from '@ionic/angular';
import { SinginEmailComponent } from './containers/singin-email/singin-email.component';
import { CoreModule } from "../../core/core.module";


@NgModule({
    declarations: [AuthShellComponent, SinginEmailComponent],
    imports: [
        AuthRoutingModule,
        CommonModule,
        IonicModule,
        CoreModule
    ]
})
export class AuthModule { }
