import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonSlides } from '@ionic/angular';
import { filter, Observable } from 'rxjs';
import { GroupsCollection } from 'src/app/database/collections/groups.collection';
import { Group } from 'src/app/database/storage.interface';

enum Slide {
    Expenses = 'expenses',
    Transfers = 'transfers',
    Totals = 'totals',
}

@Component({
    selector: 'app-group-shell',
    templateUrl: './group-shell.component.html',
    styleUrls: ['./group-shell.component.scss'],
})
export class GroupShellComponent {
    @ViewChild(IonSlides) ionSlides?: IonSlides;

    readonly Slide = Slide;
    readonly slides: Slide[] = [Slide.Expenses, Slide.Transfers, Slide.Totals];
    readonly defaultSlideIndex = 0;
    readonly slideOpts = {
        initialSlide: this.defaultSlideIndex,
    };

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
        this.control.valueChanges.subscribe((activeSlide) => {
            if (this.ionSlides) {
                this.ionSlides.slideTo(this.slides.indexOf(activeSlide));
            }
        });
    }

    slideChanged(e: any) {
        const { activeIndex } = e.target.swiper;
        this.control.setValue(this.slides[activeIndex], { emitEvent: false });
    }

    private navigateBack() {
        this.router.navigate(['..'], { relativeTo: this.route });
    }
}
