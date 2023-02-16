import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { GroupFormComponent } from './components/group-form/group-form.component';
import { CreateGroupShellComponent } from './containers/create-group-shell/create-group-shell.component';
import { EditGroupShellComponent } from './containers/edit-group-shell/edit-group-shell.component';
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
    ],
    imports: [
        GroupsRoutingModule,
        IonicModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [RouterModule],
})
export class GroupsModule {}
