import { MsFormControl } from "src/app/core/helpers/ms-form";

export interface GroupForm {
    name: MsFormControl<string>;
    members: MsFormControl<string[]>;
    currency: MsFormControl<string>;
}

export interface GroupFormValue {
    name: string;
    members: string[];
    currency: string;
}
