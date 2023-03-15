import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoreModule } from 'src/app/core/core.module';
import { PersonFormComponent } from './components/person-form/person-form.component';
import { CreatePersonComponent } from './containers/create-person/create-person.component';
import { EditPersonComponent } from './containers/edit-person/edit-person.component';
import { PeopleShellComponent } from './containers/people-shell/people-shell.component';
import { PeopleRoutingModule } from './people-routing.module';

@NgModule({
    declarations: [
        PeopleShellComponent,
        EditPersonComponent,
        CreatePersonComponent,
        PersonFormComponent,
    ],
    imports: [PeopleRoutingModule, CoreModule],
    exports: [RouterModule],
})
export class PeopleModule {}
