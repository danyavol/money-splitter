import { CdkVirtualScrollViewport, VirtualScrollStrategy } from "@angular/cdk/scrolling";
import { Subject, distinctUntilChanged } from "rxjs";

// Amount of items before and after visible viewport
const paddingAbove = 10;
const paddingBelow = 10;

export class StaticVirtualScrollStrategy implements VirtualScrollStrategy {
    itemSize = 0;

    private viewport: CdkVirtualScrollViewport | null = null;

    private scrolledIndexChange$ = new Subject<number>();
    private resizeObserver = new ResizeObserver(() => {
        (this.viewport as any)._measureViewportSize();
        this.updateRenderedRange();
    });
    scrolledIndexChange = this.scrolledIndexChange$.pipe(distinctUntilChanged());

    onContentScrolled(): void {
        this.updateRenderedRange();
    }

    onDataLengthChanged(): void {
        if (!this.viewport) return;

        const itemsCount = this.viewport.getDataLength();
        this.viewport.setTotalContentSize(itemsCount * this.itemSize);
        this.updateRenderedRange();
    }

    onContentRendered(): void {
        // Don't need this method
    }

    onRenderedOffsetChanged(): void {
        // Don't need this method
    }

    scrollToIndex(index: number, behavior?: ScrollBehavior, placement: 'top' | 'center' = 'top'): void {
        if (!this.viewport) return;

        let offset = this.getOffsetByItemIndex(index);
        if (placement === 'center') {
            const viewportSize = this.viewport.getViewportSize();
            offset -= viewportSize / 2 - this.itemSize / 2;
        }

        this.viewport.scrollToOffset(offset, behavior);
    }

    attach(viewport: CdkVirtualScrollViewport): void {
        this.viewport = viewport;
        this.onDataLengthChanged();

        this.resizeObserver.observe(this.viewport.elementRef.nativeElement);
    }

    detach(): void {
        this.viewport = null;
        this.resizeObserver.disconnect();
    }

    private getOffsetByItemIndex(index: number): number {
        return index * this.itemSize;
    }

    private getItemIndexByOffset(offset: number): number {
        return Math.floor(offset / this.itemSize);
    }

    private getItemsCountInViewport(): number {
        if (!this.viewport) return 0;

        const viewportSize = this.viewport.getViewportSize();
        const itemsCount = this.viewport.getDataLength();

        return Math.min(itemsCount, Math.ceil(viewportSize / this.itemSize));
    }

    private updateRenderedRange() {
        if (!this.viewport) return;

        const scrollOffset = this.viewport.measureScrollOffset();
        const scrollIndex = this.getItemIndexByOffset(scrollOffset);
        const dataLength = this.viewport.getDataLength();

        const start = Math.max(0, scrollIndex - paddingAbove);
        const end = Math.min(
            dataLength,
            scrollIndex + this.getItemsCountInViewport() + paddingBelow
        );

        this.viewport.setRenderedRange({ start, end });
        this.viewport.setRenderedContentOffset(
            this.getOffsetByItemIndex(start)
        );

        this.scrolledIndexChange$.next(scrollIndex);
    }
}
