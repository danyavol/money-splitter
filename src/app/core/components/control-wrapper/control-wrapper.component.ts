import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, Self } from '@angular/core';
import {
    ControlValueAccessor,
    NgControl,
    ValidationErrors
} from '@angular/forms';
import {
    map,
    merge,
    Observable,
    startWith,
    Subject,
    takeUntil
} from 'rxjs';
import { MsFormControl } from '../../helpers/ms-form-control';

const ERROR_MESSAGES: { [key: string]: string } = {
    expenseMembersLength: 'Select at least 1 person',
    expenseMembersSum: 'Sum of expenses is not equal to the total amount',
    required: 'This field is required'
};

@Component({
    selector: 'ms-control-wrapper',
    template: `
        <div class="wrapper">
            <ng-content></ng-content>
        </div>
        <div class="line" [class.error]="errorVisible$ | async"></div>
        <div class="error-message" *ngIf="errorMessage$ | async as errorMessage">{{ errorMessage }}</div>
    `,
    styleUrls: ["./control-wrapper.component.scss"],
    imports: [CommonModule],
    standalone: true,
})
export class ControlWrapperComponent
    implements OnInit, OnDestroy, ControlValueAccessor
{
    private destroy$ = new Subject<void>();

    errorVisible$?: Observable<boolean>;
    errorMessage$?: Observable<string>;

    constructor(@Self() private control: NgControl) {
        this.control.valueAccessor = this;
    }

    ngOnInit(): void {
        const control = this.control.control as MsFormControl;
        if (!control) throw Error('Control not found');

        this.errorVisible$ = merge(
            control.valueChanges,
            control.touchedChanges
        ).pipe(
            takeUntil(this.destroy$),
            map(() => control.invalid && control.touched),
            startWith(control.invalid && control.touched)
        );

        this.errorMessage$ = this.errorVisible$.pipe(
            map((errorVisible) => {
                if (errorVisible) return this.getMessage(this.control.errors);
                return '';
            }),
            startWith('')
        );
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getMessage(errors: ValidationErrors | null): string {
        if (errors === null) return '';

        const firstErrorKey = Object.keys(errors)[0];

        if (firstErrorKey && firstErrorKey in ERROR_MESSAGES) {
            return ERROR_MESSAGES[firstErrorKey];
        }

        return '';
    }

    writeValue(obj: any): void {}
    registerOnChange(fn: any): void {}
    registerOnTouched(fn: any): void {}
}
