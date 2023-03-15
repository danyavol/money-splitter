import { AbstractControl, ValidationErrors } from '@angular/forms';
import { TransferForm } from './transfer-form.interface';

export function differentRecipientValidator(control: AbstractControl<TransferForm>): ValidationErrors | null {
    const { senderId, recipientId } = control.value;

    if (!recipientId || !senderId) {
        return null;
    }

    return recipientId === senderId ? { differentRecipient: true} : null;
}

