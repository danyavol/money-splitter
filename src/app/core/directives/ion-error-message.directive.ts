import { Directive, HostBinding, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { getErrorMessage } from '../constants/error-messages.const';
import { IonInput } from '@ionic/angular';

@Directive({
    selector: '[ionErrorMessage]',
    standalone: true
})
export class IonErrorMessageDirective {
    private control = inject(NgControl);
    // private ionInput = inject(IonInput);

    @HostBinding('errorText') get errorText() {
        if (this.control.invalid && this.control.touched) {
            // this.ionInput.errorText = getErrorMessage(this.control.errors)
            return getErrorMessage(this.control.errors);
        } else {
            return "";
        }
    }
}
