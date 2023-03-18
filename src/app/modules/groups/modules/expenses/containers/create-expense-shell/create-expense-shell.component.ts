import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { ToastService } from 'src/app/core/services/toast.service';
import { ExpensesCollection } from 'src/app/database/collections/expenses.collection';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { ExpenseMember } from 'src/app/database/storage.interface';
import { getExpenseForm } from '../../expense-form.config';
import { ExpenseForm } from '../../expense-form.interface';

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
        }),
        tap((currencyCode) => {
            this.form = getExpenseForm(currencyCode);
        })
    );

    form?: FormGroup<ExpenseForm>;

    constructor(
        private membersCol: MembersCollection,
        private groupsCol: GroupsCollection,
        private expensesCol: ExpensesCollection,
        private route: ActivatedRoute,
        private router: Router,
        private toastService: ToastService
    ) {}

    createExpense(): void {
        if (!this.form) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) return;

        const value = this.form.getRawValue();

        this.expensesCol
            .createExpense({
                groupId: this.groupId,
                title: value.title,
                amount: value.amount as number,
                date: value.date,
                payers: value.payers.filter(p => p.amount !== null && p.amount !== 0) as ExpenseMember[],
                debtors: value.debtors.filter(d => d.amount !== null && d.amount !== 0) as ExpenseMember[]
            })
            .subscribe(this.goBack.bind(this));
    }

    private goBack() {
        this.router.navigate(['..'], { relativeTo: this.route });
    }
}
