import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Currency } from 'src/app/core/constants/currencies.const';
import { Member } from 'src/app/database/storage.interface';
import { ExpenseForm } from '../../expense-form.interface';

@Component({
    selector: 'app-expense-form',
    templateUrl: './expense-form.component.html',
    styleUrls: ['./expense-form.component.scss'],
})
export class ExpenseFormComponent implements OnInit {
    @Input() members: Member[] = [];
    @Input() currency!: string;
    @Input() form!: FormGroup<ExpenseForm>;

    placeholder: string = '';

    ngOnInit() {
        this.placeholder = Currency.getPlaceholder(this.currency);
    }
}
