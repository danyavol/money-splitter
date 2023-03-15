import { MsFormControl } from "src/app/core/helpers/ms-form";

export interface PersonForm {
    name: MsFormControl<string>;
}

export interface PersonFormValue {
    name: string;
}
