import { FormGroup, Validators } from "@angular/forms";
import { MsFormControl } from "src/app/core/helpers/ms-form";
import { PersonForm, PersonFormValue } from "./interfaces/person-form.interface";

export function getPersonForm(defaultValue?: PersonFormValue) {
    const value = defaultValue || getDefaultValue();

    return new FormGroup<PersonForm>({
        name: MsFormControl(value.name, { nonNullable: true, validators: [Validators.required, Validators.maxLength(20)] })
    });
}

function getDefaultValue(): PersonFormValue {
    return { name: "" };
}
