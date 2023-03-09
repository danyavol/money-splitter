import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Currency } from 'src/app/core/interfaces/currency.interface';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { GroupForm } from '../../group-form.interface';

@Component({
    selector: 'app-edit-group-shell',
    templateUrl: './edit-group-shell.component.html',
    styleUrls: ['./edit-group-shell.component.scss'],
})
export class EditGroupShellComponent {
    groupId = this.route.snapshot.paramMap.get('groupId') || '';
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
    ) {
        this.groupsCol.getGroup(this.groupId).subscribe((group) => {
            if (group) {
                this.groupForm.patchValue(group);
            } else {
                this.navigateBack();
            }
        })
    }

    saveGroup(): void {
        this.groupsCol
            .updateGroup(this.groupId, this.groupForm.getRawValue())
            .subscribe(() => {
                this.navigateBack();
            });
    }

    removeGroup(): void {
        this.groupsCol.removeGroup(this.groupId).subscribe(() => {
            this.router.navigate(["/groups"]);
        });
    }

    private navigateBack(): void {
        this.router.navigate([".."], { relativeTo: this.route });
    }
}
