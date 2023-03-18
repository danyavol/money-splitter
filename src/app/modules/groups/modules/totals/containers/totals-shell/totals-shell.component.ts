import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, first, map, Observable, shareReplay, withLatestFrom } from 'rxjs';
import { instantChanges } from 'src/app/core/helpers/helpers';
import { MsFormControl } from 'src/app/core/helpers/ms-form';
import { ExpensesCollection } from 'src/app/database/collections/expenses.collection';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { TransfersCollection } from 'src/app/database/collections/transfers.collection';
import { Member } from 'src/app/database/storage.interface';
import { calculateDebts } from '../../calculate-debts';

enum TotalType {
    Short,
    Detailed
}

export interface ViewDebt {
    to: Member;
    from: Member;
    amount: number;
}

@Component({
    selector: 'app-totals-shell',
    templateUrl: './totals-shell.component.html',
    styleUrls: ['./totals-shell.component.scss'],
})
export class TotalsShellComponent implements OnInit {
    @Input() currency!: string;

    groupId = this.route.snapshot.paramMap.get('groupId') || '';
    selectedPerson = MsFormControl();
    selectedTotalType = MsFormControl(TotalType.Short);
    TotalType = TotalType;

    members$ = this.membersCol.getGroupMembers(this.groupId);

    selectedPersonName$ = combineLatest([
        instantChanges(this.selectedPerson),
        this.members$
    ]).pipe(
        map(([personId, members]) => members.find((m: any) => m.id === personId)?.name || ""),
    );

    allDebts$!: Observable<ViewDebt[]>;

    constructor(
        private membersCol: MembersCollection,
        private expensesCol: ExpensesCollection,
        private transfersCol: TransfersCollection,
        private route: ActivatedRoute
    ) {
        this.selectFirstMember();
    }

    ngOnInit() {
        this.allDebts$ = combineLatest([
            this.expensesCol.expenses$,
            this.transfersCol.transfers$
        ]).pipe(
            map(data => calculateDebts(this.currency, ...data)),
            withLatestFrom(this.members$),
            map(([debts, members]) => {
                return debts.map(debt => ({
                    from: members.find(m => m.id === debt.from)!,
                    to: members.find(m => m.id === debt.to)!,
                    amount: debt.amount
                }));
            }),
            shareReplay(1)
        );

        this.allDebts$.subscribe();
    }

    selectFirstMember(): void {
        this.members$.pipe(first()).subscribe(members => {
            this.selectedPerson.setValue(members[0].id);
        });
    }
}
