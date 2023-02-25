import {
    Directive, EventEmitter, Host, OnInit,
    Optional,
    Output,
    ViewContainerRef
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { IonInput } from '@ionic/angular';
import IMask from 'imask';

@Directive({
    selector: '[currencyMask]',
    standalone: true,
})
export class CurrencyMaskDirective implements OnInit {
    @Output() valueChange = new EventEmitter<number>();

    readonly maskOptions: IMask.MaskedNumberOptions = {
        mask: Number, // enable number mask

        // other options are optional with defaults below
        scale: 2, // digits after point, 0 for integers
        signed: true, // disallow negative
        thousandsSeparator: ' ', // any single char
        padFractionalZeros: true, // if true, then pads zeros at end to the length of scale
        normalizeZeros: true, // appends or removes zeros at ends
        radix: '.', // fractional delimiter
        mapToRadix: [','], // symbols to process as radix
    };

    constructor(
        @Optional() private input: IonInput,
        @Optional() @Host() private control: NgControl,
        private ref: ViewContainerRef
    ) {}

    async ngOnInit() {
        let elem: HTMLInputElement = this.ref.element.nativeElement;

        if (this.input) {
            let oldElem = await this.input.getInputElement();

            // Hack to remove all event listeners
            elem = oldElem.cloneNode(true) as HTMLInputElement;
            oldElem.parentNode!.replaceChild(elem, oldElem);
        }

        const mask = IMask(elem, this.maskOptions);

        mask.on('accept', () => {
            this.control?.control?.setValue(mask.typedValue);
            this.valueChange.emit(mask.typedValue);
        });
    }
}
