import { Component, Input, HostBinding } from '@angular/core';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
    standalone: true,
})
export class ButtonComponent {
    @Input() color: 'primary' | 'accent' | 'light' | 'danger' | 'info' = 'primary';
    @Input() variant: 'solid' | 'soft' | 'text' = 'solid';

    @HostBinding('attr.color') get colorAttr() { return this.color; }
    @HostBinding('attr.variant') get variantAttr() { return this.variant; }
}
