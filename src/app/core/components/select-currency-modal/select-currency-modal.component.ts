import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Currency } from 'src/app/core/constants/currencies.const';

@Component({
    selector: 'app-select-currency-modal',
    templateUrl: './select-currency-modal.component.html',
    styleUrls: ['./select-currency-modal.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: SelectCurrencyModalComponent,
        },
    ],
})
export class SelectCurrencyModalComponent implements OnInit, ControlValueAccessor {
    @Output() close = new EventEmitter<void>();

    currencies = Currency.list;
    selectedCurrency: string | null = null;
    onChange = (value: string | null | string[]) => {};
    onTouched = () => {};

    constructor() {}

    ngOnInit() {}

    currencySelected(currencyCode: string): void {
        this.onChange(currencyCode);
        this.onTouched();
        this.close.emit();
    }

    trackByFn(_index: number, currency: { value: string, title: string }): string {
        return currency.value;
    }

    writeValue(value: string | null): void {
        this.selectedCurrency = value;
    }

    registerOnChange(fn: (value: string | null | string[]) => void): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
}
