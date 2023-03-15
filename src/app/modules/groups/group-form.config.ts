import { FormGroup, Validators } from "@angular/forms";
import { MsFormControl } from "src/app/core/helpers/ms-form";
import { Currency } from "src/app/core/interfaces/currency.interface";
import { minPeopleValidators } from "src/app/core/validators";
import { GroupForm, GroupFormValue } from "./group-form.interface";

export function getGroupForm(defaultValue?: GroupFormValue) {
    const value = defaultValue || getDefaultFormValue();

    return new FormGroup<GroupForm>({
        name: MsFormControl(value.name, { nonNullable: true, validators: Validators.required }),
        members: MsFormControl(value.members, { nonNullable: true, validators: minPeopleValidators(1) }),
        currency: MsFormControl(value.currency, { nonNullable: true, validators: Validators.required }),
    });
}

function getDefaultFormValue(): GroupFormValue {
    return {
        name: '',
        members: [],
        currency: Currency.USD
    };
}
