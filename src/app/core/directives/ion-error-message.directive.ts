import { Directive, HostBinding, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { getErrorMessage } from '../constants/error-messages.const';

@Directive({
    selector: '[ionErrorMessage]',
    standalone: true
})
export class IonErrorMessageDirective {
    private control = inject(NgControl);

    @HostBinding('errorText') get errorText() {
        if (this.control.invalid && this.control.touched) {
            return getErrorMessage(this.control.errors);
        } else {
            return "";
        }
    }
}
