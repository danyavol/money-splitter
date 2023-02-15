import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { PersonFormComponent } from "./components/person-form/person-form.component";
import { CreatePersonComponent } from "./containers/create-person/create-person.component";
import { EditPersonComponent } from "./containers/edit-person/edit-person.component";
import { PeopleShellComponent } from "./containers/people-shell/people-shell.component";
import { PeopleRoutingModule } from "./people-routing.module";

@NgModule({
    declarations: [
        PeopleShellComponent,
        EditPersonComponent,
        CreatePersonComponent,
        PersonFormComponent
    ],
    imports: [
        PeopleRoutingModule,
        IonicModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [RouterModule]
})
export class PeopleModule { }
