import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, first, map, tap } from 'rxjs';
import { MsFormControl } from 'src/app/core/helpers/ms-form';
import { ExpensesCollection } from 'src/app/database/collections/expenses.collection';
import { MembersCollection } from 'src/app/database/collections/members.collection';
import { TransfersCollection } from 'src/app/database/collections/transfers.collection';
import { calculateDebts } from '../../calculate-debts';

enum TotalType {
    Short,
    Detailed
}

@Component({
    selector: 'app-totals-shell',
    templateUrl: './totals-shell.component.html',
    styleUrls: ['./totals-shell.component.scss'],
})
export class TotalsShellComponent implements OnInit {
    groupId = this.route.snapshot.paramMap.get('groupId') || '';
    selectedPerson = MsFormControl();
    selectedTotalType = MsFormControl(TotalType.Short);
    TotalType = TotalType;

    members$ = this.membersCol.getGroupMembers(this.groupId);

    selectedPersonName$ = combineLatest([
        this.selectedPerson.valueChanges,
        this.members$
    ]).pipe(
        map(([personId, members]) => members.find(m => m.id === personId)?.name || "")
    );

    debts$ = combineLatest([
        this.expensesCol.expenses$,
        this.transfersCol.transfers$
    ]).pipe(map(data => calculateDebts(...data)));

    constructor(
        private membersCol: MembersCollection,
        private expensesCol: ExpensesCollection,
        private transfersCol: TransfersCollection,
        private route: ActivatedRoute
    ) {
        this.selectFirstMember();

        this.debts$.subscribe();
    }

    ngOnInit() {}

    selectFirstMember(): void {
        this.members$.pipe(first()).subscribe(members => {
            this.selectedPerson.setValue(members[0].id);
        });
    }
}
