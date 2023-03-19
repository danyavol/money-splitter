import { Component, Input, OnInit } from '@angular/core';
import { FullTransfer } from 'src/app/database/storage-join.interface';

@Component({
    selector: 'app-transfer-total',
    templateUrl: './transfer-total.component.html',
    styleUrls: ['./transfer-total.component.scss'],
})
export class TransferTotalComponent implements OnInit {
    @Input() personId!: string;
    @Input() transfer!: FullTransfer;

    constructor() {}

    ngOnInit() {}
}
