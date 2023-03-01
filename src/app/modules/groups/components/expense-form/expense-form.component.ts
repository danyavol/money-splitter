import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Currency } from 'src/app/core/interfaces/currency.interface';
import { Member } from 'src/app/database/storage.interface';
import { ExpenseForm } from '../../interfaces/expense-form.interface';

@Component({
    selector: 'app-expense-form',
    templateUrl: './expense-form.component.html',
    styleUrls: ['./expense-form.component.scss'],
})
export class ExpenseFormComponent {
    @Input() members: Member[] = [];
    @Input() currency: Currency | null = null;
    @Input() form!: FormGroup<ExpenseForm>;
}
