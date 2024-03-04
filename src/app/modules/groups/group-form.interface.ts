import { MsFormControl } from "src/app/core/helpers/ms-form";

export interface GroupForm {
    photo: MsFormControl<File | string | null>;
    name: MsFormControl<string>;
    members: MsFormControl<string[]>;
    currency: MsFormControl<string>;
}

export interface GroupFormValue {
    photo: File | string | null;
    name: string;
    members: string[];
    currency: string;
}
