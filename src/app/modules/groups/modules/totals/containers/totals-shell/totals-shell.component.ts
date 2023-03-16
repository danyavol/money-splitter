import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, first, map } from 'rxjs';
import { MsFormControl } from 'src/app/core/helpers/ms-form';
import { MembersCollection } from 'src/app/database/collections/members.collection';

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

    constructor(
        private membersCol: MembersCollection,
        private route: ActivatedRoute
    ) {
        this.selectFirstMember();
    }

    ngOnInit() {}

    selectFirstMember(): void {
        this.members$.pipe(first()).subscribe(members => {
            console.log(members);
            this.selectedPerson.setValue(members[0].id);
        });
    }
}
