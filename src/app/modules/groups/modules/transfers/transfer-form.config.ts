import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TransferForm, TransferFormValue } from './transfer-form.interface';

export function getTransferForm(defaultValue?: TransferFormValue) {
    const value = defaultValue || getDefaultFormValue();

    const form = new FormGroup<TransferForm>({
        title: new FormControl<string>(value.title, {
            nonNullable: true,
            validators: Validators.required,
        }),
        amount: new FormControl<number | null>(value.amount),
        date: new FormControl<string>(value.date, {
            nonNullable: true,
        }),
        senderId: new FormControl<string | null>(value.senderId, {
            validators: Validators.required,
        }),
        recipientId: new FormControl<string | null>(value.recipientId, {
            validators: Validators.required,
        }),
    });

    return form;
}

function getDefaultFormValue(): TransferFormValue {
    return {
        title: '',
        amount: null,
        date: getCurrentDate(),
        senderId: null,
        recipientId: null,
    };
}

function getCurrentDate(): string {
    // TODO: Fix date
    const date = new Date();
    date.setSeconds(0, 0);
    return date.toISOString();
}
