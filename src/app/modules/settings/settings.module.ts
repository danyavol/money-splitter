import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsShellComponent } from './settings-shell/settings-shell.component';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({
    declarations: [SettingsShellComponent],
    imports: [
        CommonModule,
        SettingsRoutingModule,
        IonicModule,
        FormsModule,
        ReactiveFormsModule,
        CoreModule,
    ],
})
export class SettingsModule {}
