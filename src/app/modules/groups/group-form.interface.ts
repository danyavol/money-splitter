import { MsFormControl } from "src/app/core/helpers/ms-form";
import { Currency } from "src/app/core/interfaces/currency.interface";

export interface GroupForm {
    name: MsFormControl<string>;
    members: MsFormControl<string[]>;
    currency: MsFormControl<Currency>;
}

export interface GroupFormValue {
    name: string;
    members: string[];
    currency: Currency;
}
