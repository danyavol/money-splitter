import { Component, OnInit } from '@angular/core';
import { MembersCollection } from 'src/app/database/collectinos/members.collection';

@Component({
    selector: 'app-people-shell',
    templateUrl: './people-shell.component.html',
    styleUrls: ['./people-shell.component.scss'],
})
export class PeopleShellComponent {

    members$ = this.membersCol.members$;

    constructor(
        private membersCol: MembersCollection
    ) { }

    createMember() {
        console.log(1);
        this.membersCol.createMember({
            name: "test",
        }).subscribe();
    }
}
