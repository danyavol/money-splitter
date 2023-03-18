import { Pipe, PipeTransform } from '@angular/core';
import { Currency } from '../constants/currencies.const';

@Pipe({
    name: 'appCurrency',
    standalone: true
})
export class CurrencyPipe implements PipeTransform {
    transform(value: number | null, currencyCode: string): string {
        if (value === null) return "";
        return Currency.format(currencyCode, value);
    }
}
