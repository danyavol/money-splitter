import { Component, Input } from '@angular/core';
import { FullTransfer } from 'src/app/database/storage-join.interface';

@Component({
    selector: 'app-transfer-total',
    templateUrl: './transfer-total.component.html',
    styleUrls: ['./transfer-total.component.scss'],
})
export class TransferTotalComponent {
    @Input() personId!: string;
    @Input() currency!: string;
    @Input() transfer!: FullTransfer;
}
