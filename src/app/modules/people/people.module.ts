import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { PeopleShellComponent } from "./containers/people-shell/people-shell.component";
import { PeopleRoutingModule } from "./people-routing.module";

@NgModule({
    declarations: [
        PeopleShellComponent
    ],
    imports: [
        PeopleRoutingModule,
        IonicModule,
        CommonModule
    ],
    exports: [RouterModule]
})
export class PeopleModule { }
