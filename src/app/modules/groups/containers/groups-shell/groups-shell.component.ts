import { Component } from '@angular/core';
import { Currency } from 'src/app/core/interfaces/currency.interface';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';

@Component({
    selector: 'app-groups-shell',
    templateUrl: './groups-shell.component.html',
    styleUrls: ['./groups-shell.component.scss'],
})
export class GroupsShellComponent {
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
