import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsCollection } from '../database/collections/groups.collection';

@Component({
    selector: 'app-folder',
    templateUrl: './folder.page.html',
    styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
    public folder!: string;

    groups$ = this.groupsCol.groups$;

    constructor(
        private activatedRoute: ActivatedRoute,
        private groupsCol: GroupsCollection
    ) { }

    ngOnInit() {
        this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
    }

    createGroup() {
        this.groupsCol.createGroup({
            name: "test",
            members: [],
            currency: "USD"
        }).subscribe();

        console.log(1);
    }

}
