import { Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Subject, map, merge, startWith, takeUntil } from 'rxjs';
import { getErrorMessage } from '../constants/error-messages.const';
import { MsFormControl } from '../helpers/ms-form';

@Directive({
    selector: '[appErrorMsg]',
    standalone: true
})
export class ErrorMessageDirective implements OnDestroy {
    @Input() appErrorMsg!: MsFormControl;
    @Output() showError = new EventEmitter<boolean>();

    destroy$ = new Subject<void>();

    constructor(private el: ElementRef) {}

    ngOnInit() {
        const control = this.appErrorMsg;

        merge(
            control.valueChanges,
            control.touchedChanges,
            control.statusChanges,
        ).pipe(
            takeUntil(this.destroy$),
            map(() => control.invalid && control.touched),
            startWith(control.invalid && control.touched)
        ).subscribe((isErrorVisible) => {
            const message = isErrorVisible ? getErrorMessage(control.errors) : '';
            this.el.nativeElement.innerText = message;

            if (isErrorVisible) {
                this.el.nativeElement.classList.add('error-msg-visible');
                this.el.nativeElement.classList.remove('error-msg-hidden');
            } else {
                this.el.nativeElement.classList.remove('error-msg-visible');
                this.el.nativeElement.classList.add('error-msg-hidden');
            }
            this.showError.emit(isErrorVisible);
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
