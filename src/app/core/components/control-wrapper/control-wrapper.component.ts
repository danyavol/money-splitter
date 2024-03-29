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
} from 'rxjs';
import { MsFormControl } from '../../helpers/ms-form';
import { IonicModule } from '@ionic/angular';
import { getErrorMessage } from '../../constants/error-messages.const';

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
                if (errorVisible) return getErrorMessage(this.extraErrorsSbj.value || this.control.errors);
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

    writeValue(obj: any): void {}
    registerOnChange(fn: any): void {}
    registerOnTouched(fn: any): void {}
}
