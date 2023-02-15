import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Currency } from 'src/app/core/interfaces/currency.interface';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { GroupForm } from '../../interfaces/group-form.interface';

@Component({
    selector: 'app-create-group-shell',
    templateUrl: './create-group-shell.component.html',
    styleUrls: ['./create-group-shell.component.scss'],
})
export class CreateGroupShellComponent {
    groupForm = new FormGroup<GroupForm>({
        name: new FormControl('', { nonNullable: true }),
        members: new FormControl([], { nonNullable: true }),
        currency: new FormControl(Currency.USD, { nonNullable: true }),
    });
    members$ = this.memberCol.members$;

    constructor(
        private groupsCol: GroupsCollection,
        private memberCol: MembersCollection,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    createGroup(): void {
        this.groupsCol
            .createGroup(this.groupForm.getRawValue())
            .subscribe((groupId) => {
                this.router.navigate([groupId], { relativeTo: this.route });
            });
    }
}
