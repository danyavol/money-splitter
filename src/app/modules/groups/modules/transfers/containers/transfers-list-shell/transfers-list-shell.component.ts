import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransfersCollection } from 'src/app/database/collections/transfers.collection';

@Component({
    selector: 'app-transfers-list-shell',
    templateUrl: './transfers-list-shell.component.html',
    styleUrls: ['./transfers-list-shell.component.scss'],
})
export class TransfersListShellComponent implements OnInit {
    @Input() currency!: string;

    groupId = this.route.snapshot.paramMap.get('groupId') || '';
    fullTransfers$ = this.transfersCol.getFullSortedTransfers(this.groupId);

    constructor(
        private transfersCol: TransfersCollection,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {}
}
