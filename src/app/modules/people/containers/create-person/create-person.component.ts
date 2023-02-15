import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { PersonForm } from '../../interfaces/person-form.interface';

@Component({
    selector: 'app-create-person',
    templateUrl: './create-person.component.html',
    styleUrls: ['./create-person.component.scss'],
})
export class CreatePersonComponent {
    memberForm = new FormGroup<PersonForm>({
        name: new FormControl("", { nonNullable: true })
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private memberCol: MembersCollection
    ) {}

    createPerson(): void {
        this.memberCol.createMember({
            name: this.memberForm.getRawValue().name
        }).subscribe(() => {
            this.router.navigate([".."], { relativeTo: this.route });
        })
    }
}
