import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Currency } from 'src/app/core/constants/currencies.const';
import { ExpenseMember } from 'src/app/database/storage.interface';

export function expenseMembersValidator(currencyCode: string, getTotalAmount: () => number | null): ValidatorFn {
    return (control: AbstractControl<ExpenseMember[]>): ValidationErrors | null => {
        /*
            Invalid if:
            1) 0 members selected
            2) Sum of amounts is not equal to totalAmount
        */

        const value = control.value;
        const total = getTotalAmount() || 0;

        // #1
        if (!value || value.length === 0) {
            return { expenseMembersLength: {
                actual: Currency.format(currencyCode, 0),
                total: Currency.format(currencyCode, total)
            } };
        }

        // #2
        const sum = Currency.round(currencyCode, value.reduce((total, member) => (member.amount || 0) + total, 0));
        if (total !== sum) {
            return { expenseMembersSum: {
                total: Currency.format(currencyCode, total),
                actual: Currency.format(currencyCode, sum),
            } };
        }

        return null;
    };
}
