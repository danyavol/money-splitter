import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { getPersonForm } from '../../person-form.config';

@Component({
    selector: 'app-create-person',
    templateUrl: './create-person.component.html',
    styleUrls: ['./create-person.component.scss'],
})
export class CreatePersonComponent {
    personForm = getPersonForm();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private memberCol: MembersCollection
    ) {}

    createPerson(): void {
        this.personForm.markAllAsTouched();
        if (this.personForm.invalid) return;

        this.memberCol.createMember({
            name: this.personForm.getRawValue().name
        }).subscribe(() => {
            this.router.navigate([".."], { relativeTo: this.route });
        })
    }
}
