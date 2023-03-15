import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { roundNumber } from 'src/app/core/helpers/helpers';
import { ExpenseMember } from 'src/app/database/storage.interface';

export function expenseMembersValidator(getTotalAmount: () => number | null): ValidatorFn {
    return (control: AbstractControl<ExpenseMember[]>): ValidationErrors | null => {
        /*
            Invalid if:
            1) 0 members selected
            2) Sum of amounts is not equal to totalAmount
        */

        const value = control.value;

        // #1
        if (!value || value.length === 0) {
            return { expenseMembersLength: true };
        }

        // #2
        const sum = roundNumber(value.reduce((total, member) => (member.amount || 0) + total, 0));
        if ((getTotalAmount() || 0) !== sum) {
            return { expenseMembersSum: true };
        }

        return null;
    };
}
