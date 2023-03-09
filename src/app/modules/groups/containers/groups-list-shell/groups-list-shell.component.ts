import { Component } from '@angular/core';
import { Currency } from 'src/app/core/interfaces/currency.interface';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';

@Component({
    selector: 'app-groups-list-shell',
    templateUrl: './groups-list-shell.component.html',
    styleUrls: ['./groups-list-shell.component.scss'],
})
export class GroupsListShellComponent {
    groups$ = this.groupsCol.groups$;

    constructor(private groupsCol: GroupsCollection) {}

    createGroup() {
        this.groupsCol
            .createGroup({
                name: 'test',
                members: [],
                currency: Currency.USD,
            })
            .subscribe();
    }
}
