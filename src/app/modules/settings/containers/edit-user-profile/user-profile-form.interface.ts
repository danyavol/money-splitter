import { MsFormControl } from "src/app/core/helpers/ms-form";

export interface UserProfileForm {
    photo: MsFormControl<File | string | null>;
    name: MsFormControl<string>;
}

export interface UserProfileFormValue {
    photo: File | string | null;
    name: string;
}
