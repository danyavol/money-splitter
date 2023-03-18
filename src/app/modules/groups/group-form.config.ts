import { FormGroup, Validators } from "@angular/forms";
import { MsFormControl } from "src/app/core/helpers/ms-form";
import { minPeopleValidators } from "src/app/core/validators";
import { GroupForm, GroupFormValue } from "./group-form.interface";

export function getGroupForm(defaultValue?: GroupFormValue) {
    const value = defaultValue || getDefaultFormValue();

    return new FormGroup<GroupForm>({
        name: MsFormControl(value.name, { nonNullable: true, validators: [Validators.required, Validators.maxLength(20)] }),
        members: MsFormControl(value.members, { nonNullable: true, validators: minPeopleValidators(1) }),
        currency: MsFormControl(value.currency, { nonNullable: true, validators: Validators.required }),
    });
}

function getDefaultFormValue(): GroupFormValue {
    return {
        name: '',
        members: [],
        currency: "USD"
    };
}
