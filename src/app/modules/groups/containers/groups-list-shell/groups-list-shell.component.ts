import { Component } from '@angular/core';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';

@Component({
    selector: 'app-groups-list-shell',
    templateUrl: './groups-list-shell.component.html',
    styleUrls: ['./groups-list-shell.component.scss'],
})
export class GroupsListShellComponent {
    groups$ = this.groupsCol.getSortedGroups();

    constructor(private groupsCol: GroupsCollection) {}
}
