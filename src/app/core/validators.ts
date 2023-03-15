import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function minPeopleValidators<T = any>(min: number): ValidatorFn {
    return (control: AbstractControl<T[]>): ValidationErrors | null => {
        return control.value.length < min ? { minPeople: min } : null;
    };
}
