import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { getGroupForm } from '../../group-form.config';

@UntilDestroy()
@Component({
    selector: 'app-create-group-shell',
    templateUrl: './create-group-shell.component.html',
    styleUrls: ['./create-group-shell.component.scss'],
})
export class CreateGroupShellComponent {
    groupForm = getGroupForm();
    members$ = this.memberCol.members$;

    constructor(
        private groupsCol: GroupsCollection,
        private memberCol: MembersCollection,
        private router: Router
    ) {}

    createGroup(): void {
        this.groupForm.markAllAsTouched();
        if (this.groupForm.invalid) return;

        this.groupsCol
            .createGroup(this.groupForm.getRawValue())
            .pipe(untilDestroyed(this))
            .subscribe((groupId) => {
                this.router.navigate(['/groups', groupId], { replaceUrl: true });
            });
    }
}
