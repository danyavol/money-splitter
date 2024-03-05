import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, Self } from '@angular/core';
import {
    ControlValueAccessor,
    NgControl,
    ValidationErrors
} from '@angular/forms';
import {
    BehaviorSubject,
    map,
    merge,
    Observable,
    startWith,
    Subject,
    takeUntil,
    tap
} from 'rxjs';
import { MsFormControl } from '../../helpers/ms-form';
import { IonicModule } from '@ionic/angular';

const ERROR_MESSAGES: { [key: string]: string | ((params: any) => string) } = {
    expenseMembersLength: 'Select at least 1 person',
    expenseMembersSum: ({actual, total}) => `Sum of expenses is not equal to the total amount.<br>Actual - ${actual}, expected - ${total}`,
    required: 'This field is required',
    differentRecipient: 'Sender and Recipient must be different people',
    minPeople: (min) => `Select at least ${min} ${min === 1 ? "person" : "people"}`,
    maxlength: ({ actualLength, requiredLength}) => `Max length is ${requiredLength}`,
    hasLinkedGoogleAccount: 'Please use your Google account to sign in',
    email: 'Please enter valid email',
    weekPassword: 'Password must be minimum 6 characters',
    passwordsNotMatch: 'Passwords do not match'
};

@Component({
    selector: 'ms-control-wrapper',
    template: `
        <div class="wrapper" [class.error]="errorVisible$ | async">
            <ng-content></ng-content>
            <ion-spinner *ngIf="withAsyncValidators" [class]="{ show: spinnerVisible$ | async }"></ion-spinner>
        </div>
        <div class="error-message" *ngIf="errorMessage$ | async as errorMessage" [innerHTML]="errorMessage"></div>
    `,
    styleUrls: ["./control-wrapper.component.scss"],
    imports: [CommonModule, IonicModule],
    standalone: true,
})
export class ControlWrapperComponent
    implements OnInit, OnDestroy, ControlValueAccessor
{
    @Input() set extraErrors(value: ValidationErrors | null) {
        this.extraErrorsSbj.next(value);
    };

    @Input() withAsyncValidators: boolean = false;

    private extraErrorsSbj = new BehaviorSubject<ValidationErrors | null>(null);
    private destroy$ = new Subject<void>();

    errorVisible$?: Observable<boolean>;
    errorMessage$?: Observable<string>;
    spinnerVisible$?: Observable<boolean>;

    constructor(@Self() private control: NgControl) {
        this.control.valueAccessor = this;
    }

    ngOnInit(): void {
        const control = this.control.control as MsFormControl;
        if (!control) throw Error('Control not found');
        if (!control.touchedChanges) throw Error("You must use MsFormControl instead of FormControl");

        this.errorVisible$ = merge(
            control.valueChanges,
            control.touchedChanges,
            control.statusChanges,
            this.extraErrorsSbj.asObservable()
        ).pipe(
            takeUntil(this.destroy$),
            map(() => (control.invalid && control.touched) || !!this.extraErrorsSbj.value),
            startWith((control.invalid && control.touched) || !!this.extraErrorsSbj.value)
        );

        this.errorMessage$ = this.errorVisible$.pipe(
            map((errorVisible) => {
                if (errorVisible) return this.getMessage(this.extraErrorsSbj.value || this.control.errors);
                return '';
            }),
            startWith('')
        );

        this.spinnerVisible$ = control.statusChanges?.pipe(
            startWith(control.status),
            map(status => status === "PENDING"),
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
            const validationMessage = ERROR_MESSAGES[firstErrorKey];
            if (typeof validationMessage === "string") {
                return validationMessage;
            } else {
                return validationMessage(errors[firstErrorKey]);
            }
        }

        return '';
    }

    writeValue(obj: any): void {}
    registerOnChange(fn: any): void {}
    registerOnTouched(fn: any): void {}
}
