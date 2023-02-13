import { Component } from '@angular/core';
import { MembersCollection } from 'src/app/database/collections/members.collection';

@Component({
    selector: 'app-people-shell',
    templateUrl: './people-shell.component.html',
    styleUrls: ['./people-shell.component.scss'],
})
export class PeopleShellComponent {
    members$ = this.membersCol.members$;

    constructor(private membersCol: MembersCollection) {}

    createMember() {
        this.membersCol.createMember({ name: `First Name ${new Date().getMilliseconds()}` }).subscribe();
    }
}
