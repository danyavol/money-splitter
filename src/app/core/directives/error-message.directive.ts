import { Directive, ElementRef, OnDestroy, OnInit, Self } from '@angular/core';
import { ControlValueAccessor, NgControl, ValidationErrors } from '@angular/forms';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';

const ERROR_MESSAGES: {[key: string]: string} = {
    expenseMembersLength: "Select at least 1 person",
    expenseMembersSum: "Sum of expenses is not equal to the total amount"
};

@Directive({
    selector: '[errorMessage]',
    standalone: true,
})
export class ErrorMessageDirective implements OnInit, OnDestroy, ControlValueAccessor {
    private destroy$ = new Subject<void>();

    errorMessage$ = new BehaviorSubject<string>("");

    constructor(@Self() private control: NgControl, private elem: ElementRef) {
        this.control.valueAccessor = this;
    }

    ngOnInit(): void {
        this.control.valueChanges?.pipe(takeUntil(this.destroy$)).subscribe(() => {
            const msg = this.getMessage(this.control.errors)
            this.errorMessage$.next(msg);
            console.log("[errorMessage]", this.control.errors);
        });

        this.errorMessage$.subscribe((msg) => {
            this.elem.nativeElement.innerText = msg;
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getMessage(errors: ValidationErrors | null): string {
        if (errors === null) return "";

        const firstErrorKey = Object.keys(errors)[0];

        if (firstErrorKey && firstErrorKey in ERROR_MESSAGES) {
            return ERROR_MESSAGES[firstErrorKey];
        }

        return "";
    }

    writeValue(obj: any): void {}
    registerOnChange(fn: any): void { }
    registerOnTouched(fn: any): void {}
}
