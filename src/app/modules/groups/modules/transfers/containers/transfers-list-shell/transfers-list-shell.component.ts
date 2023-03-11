import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransfersCollection } from 'src/app/database/collections/transfers.collection';

@Component({
    selector: 'app-transfers-list-shell',
    templateUrl: './transfers-list-shell.component.html',
    styleUrls: ['./transfers-list-shell.component.scss'],
})
export class TransfersListShellComponent implements OnInit {
    groupId = this.route.snapshot.paramMap.get('groupId') || '';
    fullTransfers$ = this.transfersCol.getFullTransfers(this.groupId);

    constructor(
        private transfersCol: TransfersCollection,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {}
}
