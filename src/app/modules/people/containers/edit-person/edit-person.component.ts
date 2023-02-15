import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { Member } from 'src/app/database/storage.interface';
import { PersonForm } from '../../interfaces/person-form.interface';

@Component({
    selector: 'app-edit-person',
    templateUrl: './edit-person.component.html',
    styleUrls: ['./edit-person.component.scss'],
})
export class EditPersonComponent {
    memberId = this.route.snapshot.paramMap.get('memberId') || '';
    member: Member | null = null;
    memberForm = new FormGroup<PersonForm>({
        name: new FormControl("", { nonNullable: true })
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private memberCol: MembersCollection
    ) {
        this.memberCol.getMember(this.memberId).subscribe(member => {
            if (member) {
                this.memberForm.setValue({ name: member.name });
                this.member = member;
            } else {
                this.router.navigate([".."], { relativeTo: this.route });
            }
        })
    }

    savePerson(): void {
        if (!this.member) return;

        this.memberCol.updateMember({
            ...this.member,
            name: this.memberForm.getRawValue().name
        }).subscribe(() => {
            this.router.navigate([".."], { relativeTo: this.route });
        })
    }
}
