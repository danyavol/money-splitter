import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ToastService } from 'src/app/core/services/toast.service';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';
import { MembersCollection } from 'src/app/database/collections/members.collection';

@Component({
    selector: 'app-create-expense-shell',
    templateUrl: './create-expense-shell.component.html',
    styleUrls: ['./create-expense-shell.component.scss'],
})
export class CreateExpenseShellComponent implements OnInit {
    groupId = this.route.snapshot.paramMap.get('groupId') || '';
    members$ = this.membersCol.getGroupMembers(this.groupId);
    currency$ = this.groupsCol.getGroup(this.groupId).pipe(
        map((group) => {
            if (!group) {
                this.router.navigate(['..'], { relativeTo: this.route });
                this.toastService.error("Invalid group ID");
                throw new Error("Invalid group ID");
            }
            return group.currency;
        })
    );

    constructor(
        private membersCol: MembersCollection,
        private groupsCol: GroupsCollection,
        private route: ActivatedRoute,
        private router: Router,
        private toastService: ToastService
    ) {}

    ngOnInit() {}
}
