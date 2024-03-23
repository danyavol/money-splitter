import { VIRTUAL_SCROLL_STRATEGY } from "@angular/cdk/scrolling";
import { Directive, Input, OnChanges, SimpleChanges, forwardRef } from "@angular/core";
import { StaticVirtualScrollStrategy } from "../helpers/static-virtual-scroll-strategy";

@Directive({
    selector: "[msStaticVirtualScroll]",
    standalone: true,
    providers: [
        {
            provide: VIRTUAL_SCROLL_STRATEGY,
            useFactory: (d: StaticVirtualScrollDirective) => d.scrollStrategy,
            deps: [forwardRef(() => StaticVirtualScrollDirective)]
        },
        {
            provide: StaticVirtualScrollStrategy,
            useFactory: (d: StaticVirtualScrollDirective) => d.scrollStrategy,
            deps: [forwardRef(() => StaticVirtualScrollDirective)]
        }
    ]
})
export class StaticVirtualScrollDirective implements OnChanges {
    scrollStrategy = new StaticVirtualScrollStrategy();

    @Input() itemSize?: number;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['itemSize'].currentValue != null) {
            this.scrollStrategy.itemSize = changes['itemSize'].currentValue;
        }
    }
}
