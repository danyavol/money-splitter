import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ToastService } from 'src/app/core/services/toast.service';
import { ExpensesCollection } from 'src/app/database/collections/expenses.collection';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { getExpenseForm } from '../../expense-form.config';

@Component({
    selector: 'app-create-expense-shell',
    templateUrl: './create-expense-shell.component.html',
    styleUrls: ['./create-expense-shell.component.scss'],
})
export class CreateExpenseShellComponent {
    groupId = this.route.snapshot.paramMap.get('groupId') || '';
    members$ = this.membersCol.getGroupMembers(this.groupId);
    currency$ = this.groupsCol.getGroup(this.groupId).pipe(
        map((group) => {
            if (!group) {
                this.goBack();
                this.toastService.error('Invalid group ID');
                throw new Error('Invalid group ID');
            }
            return group.currency;
        })
    );

    form = getExpenseForm();

    constructor(
        private membersCol: MembersCollection,
        private groupsCol: GroupsCollection,
        private expensesCol: ExpensesCollection,
        private route: ActivatedRoute,
        private router: Router,
        private toastService: ToastService
    ) {}

    createExpense(): void {
        this.form.markAllAsTouched();
        if (this.form.invalid) return;

        this.expensesCol
            .createExpense({
                groupId: this.groupId,
                ...this.form.getRawValue(),
            })
            .subscribe(this.goBack.bind(this));
    }

    private goBack() {
        this.router.navigate(['..'], { relativeTo: this.route });
    }
}
