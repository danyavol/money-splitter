import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[appAutofocus]',
    standalone: true
})
export class AutofocusDirective implements AfterViewInit {
    constructor(private el: ElementRef) {}

    public ngAfterViewInit() {
        setTimeout(() => this.el.nativeElement.focus());
    }
}
