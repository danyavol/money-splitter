import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, map, Observable, startWith, Subject } from 'rxjs';
import { allCurrencies } from 'src/app/core/constants/currencies.const';
import { Member } from 'src/app/database/storage.interface';
import { GroupForm } from '../../interfaces/group-form.interface';

const MAX_LENGTH = 20;
const EMPTY_SYMBOL = "";



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

                let membersStr = selectedMembers.splice(0, 1)[0];
                for (let member of selectedMembers) {
                    const nextName = ', ' + member;

                    if (membersStr.length + nextName.length < MAX_LENGTH) {
                        membersStr += nextName;
                    } else {
                        membersStr += ', ...';
                        break;
                    }
                }

                return membersStr;
            })
        );
    }
}
