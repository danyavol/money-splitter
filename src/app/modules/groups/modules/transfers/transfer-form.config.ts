import { Validators } from '@angular/forms';
import { MsFormControl, MsFormGroup } from 'src/app/core/helpers/ms-form';
import { differentRecipientValidator } from './different-recipient.validator';
import { TransferForm, TransferFormValue } from './transfer-form.interface';

export function getTransferForm(defaultValue?: TransferFormValue) {
    const value = defaultValue || getDefaultFormValue();

    const form = MsFormGroup<TransferForm>({
        title: MsFormControl<string>(value.title, {
            nonNullable: true,
            validators: Validators.required,
        }),
        amount: MsFormControl<number | null>(value.amount, [Validators.required]),
        date: MsFormControl<string>(value.date, {
            nonNullable: true,
        }),
        senderId: MsFormControl<string | null>(value.senderId, {
            validators: Validators.required,
        }),
        recipientId: MsFormControl<string | null>(value.recipientId, Validators.required)
    }, differentRecipientValidator);

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
