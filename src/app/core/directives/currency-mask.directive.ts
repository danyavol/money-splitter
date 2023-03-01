import {
    Directive,
    EventEmitter,
    Input,
    OnInit,
    Optional,
    Output,
    Self,
    SimpleChanges,
    ViewContainerRef,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { IonInput } from '@ionic/angular';
import IMask from 'imask';

@Directive({
    selector: '[currencyMask]',
    standalone: true,
})
export class CurrencyMaskDirective implements OnInit {
    @Input() maskValue: number | null = null;
    @Output() valueChange = new EventEmitter<number | null>();

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

    private skipNextValueChange = false;
    private element?: HTMLInputElement;
    private mask?: IMask.InputMask<IMask.MaskedNumberOptions>;
    private initialValue: number | null = null;

    constructor(
        @Optional() private input: IonInput,
        @Optional() @Self() private control: NgControl,
        private ref: ViewContainerRef
    ) {}

    async ngOnInit() {
        this.element = this.ref.element.nativeElement;

        if (this.input) {
            let oldElem = await this.input.getInputElement();

            // Hack to remove all event listeners
            this.element = oldElem.cloneNode(true) as HTMLInputElement;
            oldElem.parentNode!.replaceChild(this.element, oldElem);
        }

        if (!this.element) return;

        this.element.value = this.initialValue === null ? "" :  this.initialValue.toString();

        this.mask = IMask(this.element, this.maskOptions);

        this.mask.on('accept', () => {
            if (this.skipNextValueChange) {
                this.skipNextValueChange = false;
                return;
            }

            const newValue = !this.mask!.value ? null : this.mask!.typedValue;
            this.control?.control?.setValue(newValue);
            this.valueChange.emit(newValue);
        });
    }

    ngOnChanges(currentValue: SimpleChanges) {
        if ('maskValue' in currentValue) {
            const value = currentValue['maskValue'].currentValue;

            if (currentValue['maskValue'].firstChange) {
                this.initialValue = value;
            }

            if (this.element && this.mask) {
                if (
                    typeof value === 'number' &&
                    this.mask.typedValue !== value
                ) {
                    this.skipNextValueChange = true;
                    this.mask.typedValue = value;
                } else if (value === null && this.mask.value !== '') {
                    this.skipNextValueChange = true;
                    this.mask.value = '';
                }
            }
        }
    }
}
