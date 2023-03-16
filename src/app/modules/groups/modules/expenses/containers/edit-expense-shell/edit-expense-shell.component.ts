import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ToastService } from 'src/app/core/services/toast.service';
import { ExpensesCollection } from 'src/app/database/collections/expenses.collection';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { ExpenseMember } from 'src/app/database/storage.interface';
import { getExpenseForm } from '../../expense-form.config';
import { ExpenseForm } from '../../expense-form.interface';

@Component({
    selector: 'app-edit-expense-shell',
    templateUrl: './edit-expense-shell.component.html',
    styleUrls: ['./edit-expense-shell.component.scss'],
})
export class EditExpenseShellComponent implements OnInit {
    groupId = this.route.snapshot.paramMap.get('groupId') || '';
    expenseId = this.route.snapshot.paramMap.get('expenseId') || '';
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

    form?: FormGroup<ExpenseForm>;

    constructor(
        private membersCol: MembersCollection,
        private groupsCol: GroupsCollection,
        private expensesCol: ExpensesCollection,
        private route: ActivatedRoute,
        private router: Router,
        private toastService: ToastService
    ) {}

    ngOnInit() {
        this.expensesCol.getExpense(this.expenseId).subscribe((expense) => {
            if (expense) {
                this.form = getExpenseForm(expense);
            } else {
                this.goBack();
                this.toastService.error('Invalid expense ID');
                throw new Error('Invalid expense ID');
            }
        });
    }

    saveExpense(): void {
        if (!this.form) return;

        this.form.markAllAsTouched();

        if (this.form.invalid) return;

        const value = this.form.getRawValue();

        this.expensesCol
            .updateExpense(this.expenseId, {
                title: value.title,
                amount: value.amount as number,
                date: value.date,
                payers: value.payers.filter(p => p.amount !== null) as ExpenseMember[],
                debtors: value.debtors.filter(p => p.amount !== null) as ExpenseMember[]
            })
            .subscribe(this.goBack.bind(this));
    }

    removeExpense() {
        this.expensesCol.removeExpense(this.expenseId).subscribe(this.goBack.bind(this));
    }

    private goBack() {
        this.router.navigate(['../..'], { relativeTo: this.route });
    }
}
