import { FormControl, FormGroup } from "@angular/forms";

export interface TransferForm {
    title: FormControl<string>;
    amount: FormControl<number | null>;
    date: FormControl<string>;
    senderId: FormControl<string | null>;
    recipientId: FormControl<string | null>;
}

export interface TransferFormValue {
    title: string;
    amount: number | null;
    date: string;
    senderId: string | null;
    recipientId: string | null;
}
