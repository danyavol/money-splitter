import { AsyncValidatorFn, FormControl, FormControlOptions, FormControlState, ValidatorFn } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

export interface MsFormControl<TValue = any> extends FormControl<TValue> {
    touchedChanges: Observable<boolean>;
}

export function MsFormControl<TValue = any>(
    formState: TValue | FormControlState<TValue> = null as unknown as TValue,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
): MsFormControl<TValue> {
    const touchedChangesSbj = new Subject<boolean>();
    const control = new FormControl<TValue>(formState, validatorOrOpts, asyncValidator) as MsFormControl<TValue>;

    control.touchedChanges = touchedChangesSbj.asObservable();

    const _markAsTouched = control.markAsTouched;
    control.markAsTouched = () => {
        _markAsTouched.apply(control);
        touchedChangesSbj.next(control.touched);
    };

    const _markAsUntouched = control.markAsUntouched;
    control.markAsUntouched = () => {
        _markAsUntouched.apply(control);
        touchedChangesSbj.next(control.touched);
    };

    return control;
}
