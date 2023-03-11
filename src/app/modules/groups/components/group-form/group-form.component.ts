import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { allCurrencies } from 'src/app/core/constants/currencies.const';
import { MembersListPipe } from 'src/app/core/pipes/members-list.pipe';
import { Member } from 'src/app/database/storage.interface';
import { GroupForm } from '../../group-form.interface';

@Component({
    selector: 'app-group-form',
    templateUrl: './group-form.component.html',
    styleUrls: ['./group-form.component.scss'],
})
export class GroupFormComponent {
    @Input() form!: FormGroup<GroupForm>;
    @Input() members$!: Observable<Member[]>;

    currencies = allCurrencies;

    selectedMembers$?: Observable<string | null>;

    constructor(private memberListPipe: MembersListPipe) {}

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
    }
}
