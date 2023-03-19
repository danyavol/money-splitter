import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { ExpensesCollection } from 'src/app/database/collections/expenses.collection';
import { TransfersCollection } from 'src/app/database/collections/transfers.collection';
import { FullExpense, FullTransfer } from 'src/app/database/storage-join.interface';

@Component({
    selector: 'app-totals-detailed-form-shell',
    templateUrl: './totals-detailed-form-shell.component.html',
    styleUrls: ['./totals-detailed-form-shell.component.scss'],
})
export class TotalsDetailedFormShellComponent implements OnInit {
    @Input() currency!: string;
    @Input() set personId(value: string) {
        this.personIdSbj.next(value);
    }
    groupId = this.route.snapshot.paramMap.get('groupId') || '';

    personIdSbj = new BehaviorSubject('');

    personExpenses$!: Observable<FullExpense[]>;
    personTransfers$!: Observable<FullTransfer[]>;

    constructor(
        private expensesCol: ExpensesCollection,
        private transfersCol: TransfersCollection,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.personExpenses$ = combineLatest([
            this.expensesCol.getFullSortedExpenses(this.groupId),
            this.personIdSbj
        ]).pipe(
            map(([expenses, personId]) =>
                expenses.filter(expense =>
                    !!expense.debtors.find(d => d.memberId === personId)
                    || !!expense.payers.find(d => d.memberId === personId)
                )
            )
        );

        this.personTransfers$ = combineLatest([
            this.transfersCol.getFullSortedTransfers(this.groupId),
            this.personIdSbj
        ]).pipe(
            map(([transfers, personId]) =>
                transfers.filter(transfer =>
                    transfer.recipientId === personId
                    || transfer.senderId === personId
                )
            )
        );
    }
}
