import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ToastService } from 'src/app/core/services/toast.service';
import { ExpensesCollection } from 'src/app/database/collections/expenses.collection';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { ExpenseMember } from 'src/app/database/storage.interface';
import { ExpenseForm } from '../../../interfaces/expense-form.interface';
import { expenseMembersValidator } from '../../../validators/expense-members-control.validator';

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
                this.goBack();
                this.toastService.error('Invalid group ID');
                throw new Error('Invalid group ID');
            }
            return group.currency;
        })
    );

    form = new FormGroup<ExpenseForm>({
        title: new FormControl<string>('', {
            nonNullable: true,
            validators: Validators.required,
        }),
        amount: new FormControl<number | null>(null),
        date: new FormControl<string>(this.getCurrentDate(), {
            nonNullable: true,
        }),
        payers: new FormControl<ExpenseMember[]>([], {
            nonNullable: true,
            validators: expenseMembersValidator(this.getTotalAmount.bind(this)),
        }),
        debtors: new FormControl<ExpenseMember[]>([], {
            nonNullable: true,
            validators: expenseMembersValidator(this.getTotalAmount.bind(this)),
        }),
    });

    constructor(
        private membersCol: MembersCollection,
        private groupsCol: GroupsCollection,
        private expensesCol: ExpensesCollection,
        private route: ActivatedRoute,
        private router: Router,
        private toastService: ToastService
    ) {}

    ngOnInit() {}

    createExpense(): void {
        this.form.markAllAsTouched();
        // Coolhack to trigger valueChange
        this.form.disable();
        this.form.enable();

        if (this.form.invalid) return;

        this.expensesCol
            .createExpense({
                groupId: this.groupId,
                ...this.form.getRawValue(),
            })
            .subscribe(this.goBack.bind(this));
    }

    getCurrentDate(): string {
        // TODO: Fix date
        const date = new Date();
        date.setSeconds(0, 0);
        return date.toISOString();
    }

    getTotalAmount(): number | null {
        return this.form.controls.amount.value;
    }

    private goBack() {
        this.router.navigate(['..'], { relativeTo: this.route });
    }
}
