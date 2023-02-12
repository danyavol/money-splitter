import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { GroupsShellComponent } from "./containers/groups-shell/groups-shell.component";
import { GroupsRoutingModule } from "./groups-routing.module";

@NgModule({
    declarations: [
        GroupsShellComponent
    ],
    imports: [
        GroupsRoutingModule,
        IonicModule,
        CommonModule
    ],
    exports: [RouterModule]
})
export class GroupsModule { }
