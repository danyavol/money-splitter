import { AbstractControl, AbstractControlOptions, AsyncValidatorFn, FormControl, FormControlOptions, FormControlState, FormGroup, ValidatorFn } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

export interface MsFormControl<TValue = any> extends FormControl<TValue> {
    touchedChanges: Observable<boolean>;
}

export interface MsFormGroup<TControl extends {
    [K in keyof TControl]: AbstractControl<any>;
} = any> extends FormGroup<TControl> {
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

export function MsFormGroup<TControl extends {
    [K in keyof TControl]: AbstractControl<any>;
} = any>(
    controls: TControl,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
): MsFormGroup<TControl> {
    const touchedChangesSbj = new Subject<boolean>();
    const group = new FormGroup<TControl>(controls, validatorOrOpts, asyncValidator) as MsFormGroup<TControl>;

    group.touchedChanges = touchedChangesSbj.asObservable();

    const _markAsTouched = group.markAsTouched;
    group.markAsTouched = () => {
        _markAsTouched.apply(group);
        touchedChangesSbj.next(group.touched);
    };

    const _markAsUntouched = group.markAsUntouched;
    group.markAsUntouched = () => {
        _markAsUntouched.apply(group);
        touchedChangesSbj.next(group.touched);
    };

    return group;
}
