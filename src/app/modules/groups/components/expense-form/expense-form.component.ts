import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Currency } from 'src/app/core/interfaces/currency.interface';
import { ExpenseMember, Member } from 'src/app/database/storage.interface';

@Component({
    selector: 'app-expense-form',
    templateUrl: './expense-form.component.html',
    styleUrls: ['./expense-form.component.scss'],
})
export class ExpenseFormComponent {
    @Input() members: Member[] = [];
    @Input() currency: Currency | null = null;
    @Input() form = new FormGroup({
        title: new FormControl<string>('', { nonNullable: true }),
        amount: new FormControl<number | null>(null),
        date: new FormControl<string>(this.getCurrentDate(), { nonNullable: true }),
        payers: new FormControl<ExpenseMember[]>([], { nonNullable: true }),
        debtors: new FormControl<ExpenseMember[]>([], { nonNullable: true }),
    });

    getCurrentDate(): string {
        const date = new Date();
        date.setSeconds(0, 0);
        return date.toISOString();
    }
}
