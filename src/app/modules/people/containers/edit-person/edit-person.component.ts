import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { PersonForm } from '../../interfaces/person-form.interface';

@Component({
    selector: 'app-edit-person',
    templateUrl: './edit-person.component.html',
    styleUrls: ['./edit-person.component.scss'],
})
export class EditPersonComponent {
    memberId = this.route.snapshot.paramMap.get('memberId') || '';
    member$ = this.memberCol.getMember(this.memberId);

    memberForm = new FormGroup<PersonForm>({
        name: new FormControl("", { nonNullable: true })
    });

    constructor(
        private route: ActivatedRoute,
        private memberCol: MembersCollection
    ) {}
}
