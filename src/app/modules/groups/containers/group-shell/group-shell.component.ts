import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicSlides } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, Observable } from 'rxjs';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';
import { Group } from 'src/app/database/storage.interface';
import Swiper from 'swiper';

enum Slide {
    Expenses = 'expenses',
    Transfers = 'transfers',
    Totals = 'totals',
}

@UntilDestroy()
@Component({
    selector: 'app-group-shell',
    templateUrl: './group-shell.component.html',
    styleUrls: ['./group-shell.component.scss'],
})
export class GroupShellComponent {
    @ViewChild('swiper') swiperRef?: ElementRef;

    get swiper(): Swiper {
        return this.swiperRef?.nativeElement.swiper;
    }

    swiperModules = [IonicSlides];

    readonly Slide = Slide;
    readonly slides: Slide[] = [Slide.Expenses, Slide.Transfers, Slide.Totals];
    readonly defaultSlideIndex = 0;

    groupId = this.route.snapshot.paramMap.get('groupId') || '';
    group$ = this.groupsCol.getGroup(this.groupId).pipe(
        filter((group) => {
            if (!group) this.navigateBack();
            return !!group;
        })
    ) as Observable<Group>;

    control = new FormControl<Slide>(this.slides[this.defaultSlideIndex], {
        nonNullable: true,
    });

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private groupsCol: GroupsCollection
    ) {
        this.control.valueChanges.pipe(untilDestroyed(this)).subscribe((activeSlide) => {
            if (this.swiper) {
                this.swiper.slideTo(this.slides.indexOf(activeSlide));
            }
        });
    }

    slideChanged(e: any) {
        const [swiper] = e.detail as [Swiper];
        this.control.setValue(this.slides[swiper.activeIndex], { emitEvent: false });
    }

    private navigateBack() {
        this.router.navigate(['..'], { relativeTo: this.route });
    }
}
