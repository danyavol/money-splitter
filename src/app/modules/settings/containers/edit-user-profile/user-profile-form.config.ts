import { FormGroup, Validators } from '@angular/forms';
import { MsFormControl } from 'src/app/core/helpers/ms-form';
import {
    UserProfileForm,
    UserProfileFormValue,
} from './user-profile-form.interface';

export function getUserProfileForm(defaultValue?: UserProfileFormValue) {
    const value = defaultValue || getDefaultFormValue();

    return new FormGroup<UserProfileForm>({
        photo: MsFormControl(value.photo),
        name: MsFormControl(value.name, {
            nonNullable: true,
            validators: [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(50),
            ],
        }),
    });
}

function getDefaultFormValue(): UserProfileFormValue {
    return {
        photo: null,
        name: '',
    };
}
