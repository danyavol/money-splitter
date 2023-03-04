import { Pipe, PipeTransform } from '@angular/core';
import * as IMask from 'imask';
import { currencyMaskOptions } from '../directives/currency-mask.directive';
import { Currency } from '../interfaces/currency.interface';

@Pipe({
    name: 'appCurrency',
    standalone: true
})
export class CurrencyPipe implements PipeTransform {
    transform(value: number | string | null, currency: Currency | string): string {
        const _value = value === null ? "" : "" + value;
        return currency + " " + IMask.pipe(_value, currencyMaskOptions);
    }
}
