import { Component, Input, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, map, Observable, of, startWith, switchMap } from 'rxjs';
import { MembersListPipe } from 'src/app/core/pipes/members-list.pipe';
import { Member } from 'src/app/database/storage.interface';
import { GroupForm } from '../../group-form.interface';
import {} from "@angular/fire"
import { DatabaseService } from 'src/app/database/database.service';
import { ExtendedCurrency } from 'src/app/types/currency.type';
import { ModalAnimation } from 'src/app/core/animations/modal.animation';

@Component({
    selector: 'app-group-form',
    templateUrl: './group-form.component.html',
    styleUrls: ['./group-form.component.scss'],
})
export class GroupFormComponent {
    @Input() form!: FormGroup<GroupForm>;
    @Input() members$!: Observable<Member[]>;

    currencies$ = inject(DatabaseService).currencies$;
    selectedMembers$!: Observable<string | null>;
    selectedCurrency$!: Observable<ExtendedCurrency | null>;

    constructor(private memberListPipe: MembersListPipe, public anim: ModalAnimation) {}

    ngOnInit() {
        this.selectedMembers$ = combineLatest([
            this.form.controls.members.valueChanges.pipe(
                startWith(this.form.controls.members.value)
            ),
            this.members$
        ]).pipe(
            map(([ids, members]) => {
                const selectedMembers = members.filter(m => ids.includes(m.id)).map(m => m.name);
                if (!selectedMembers.length) return null;

                return this.memberListPipe.transform(selectedMembers, 30);
            })
        );

        this.selectedCurrency$ = this.form.controls.currency.valueChanges.pipe(
            startWith(this.form.controls.currency.value),
            switchMap((code) => combineLatest([
                of(code), this.currencies$
            ])),
            map(([value, currencies]) => {
                return currencies.find(c => c.code === value) || null
            })
        );

    }
}
