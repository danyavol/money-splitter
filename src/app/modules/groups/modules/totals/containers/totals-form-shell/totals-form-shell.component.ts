import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, map, share, tap } from 'rxjs';
import { ExpensesCollection } from 'src/app/database/collections/expenses.collection';
import { TransfersCollection } from 'src/app/database/collections/transfers.collection';

@Component({
    selector: 'app-totals-form-shell',
    templateUrl: './totals-form-shell.component.html',
    styleUrls: ['./totals-form-shell.component.scss'],
})
export class TotalsFormShellComponent implements OnInit {
    @Input() set personId(value: string) {
        this.personIdSbj.next(value);
    }
    personIdSbj = new BehaviorSubject('');
    groupId = this.route.snapshot.paramMap.get('groupId') || '';
    expenses$ = this.expensesCol
        .getFullSortedExpenses(this.groupId)
        .pipe(share());

    transfers$ = this.transfersCol
        .getFullSortedTransfers(this.groupId)
        .pipe(share());

    private expensesTotal$ = combineLatest([this.expenses$, this.personIdSbj]).pipe(
        map(([expenses, personId]) =>
            expenses.reduce((total, expense) => {
                const person = expense.payers.find(
                    (p: any) => p.memberId === personId
                );
                return total - (person?.amount || 0);
            }, 0)
        ),
    );

    private transfersTotal$ = combineLatest([this.transfers$, this.personIdSbj]).pipe(
        map(([transfers, personId]) =>
            transfers.reduce((total, transfer) => {
                if (transfer.recipientId === personId)
                    return total + transfer.amount;
                if (transfer.senderId === personId)
                    return total - transfer.amount;
                else
                    return total;
            }, 0)
        )
    );

    totalBalance$ = combineLatest([this.expensesTotal$, this.transfersTotal$]).pipe(
        map(([expensesTotal, transfersTotal]) => expensesTotal + transfersTotal)
    );

    constructor(
        private expensesCol: ExpensesCollection,
        private transfersCol: TransfersCollection,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {}
}
