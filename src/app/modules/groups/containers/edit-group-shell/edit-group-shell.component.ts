import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { getGroupForm } from '../../group-form.config';

@Component({
    selector: 'app-edit-group-shell',
    templateUrl: './edit-group-shell.component.html',
    styleUrls: ['./edit-group-shell.component.scss'],
})
export class EditGroupShellComponent {
    groupId = this.route.snapshot.paramMap.get('groupId') || '';
    groupForm = getGroupForm();
    members$ = this.memberCol.members$;

    constructor(
        private groupsCol: GroupsCollection,
        private memberCol: MembersCollection,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.groupsCol.getGroup(this.groupId).pipe(first()).subscribe((group) => {
            if (group) {
                this.groupForm.patchValue(group);
            } else {
                this.navigateBack();
            }
        })
    }

    saveGroup(): void {
        this.groupForm.markAllAsTouched();
        if (this.groupForm.invalid) return;

        this.groupsCol
            .updateGroup(this.groupId, this.groupForm.getRawValue())
            .pipe(first())
            .subscribe(() => {
                this.navigateBack();
            });
    }

    removeGroup(): void {
        this.groupsCol.removeGroup(this.groupId).pipe(first()).subscribe(() => {
            this.router.navigate(["/groups"]);
        });
    }

    private navigateBack(): void {
        this.router.navigate([".."], { relativeTo: this.route });
    }
}
