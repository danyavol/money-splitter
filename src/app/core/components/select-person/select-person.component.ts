import { CommonModule } from '@angular/common';
import {
    Component, Input,
    OnInit,
    ViewChild
} from '@angular/core';
import {
    ControlValueAccessor, NG_VALUE_ACCESSOR
} from '@angular/forms';
import { CheckboxCustomEvent, IonicModule, IonModal } from '@ionic/angular';
import {
    BehaviorSubject,
    combineLatest,
    map,
    Observable
} from 'rxjs';
import { Member } from 'src/app/database/storage.interface';

interface CheckedboxMember extends Member {
    checked: boolean;
}

@Component({
    selector: 'app-select-person',
    templateUrl: './select-person.component.html',
    styleUrls: ['./select-person.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: SelectPersonComponent,
        },
    ],
})
export class SelectPersonComponent implements OnInit, ControlValueAccessor {
    @Input() set people(people: Member[]) {
        this.people$.next(people);
    }

    @ViewChild(IonModal) modal?: IonModal;

    selectedIds = new Set<string>();
    selectedIds$ = new BehaviorSubject<Set<string>>(this.selectedIds);
    people$ = new BehaviorSubject<Member[]>([]);
    checkboxPeople$!: Observable<CheckedboxMember[]>;

    onChange = (value: string[]) => {};

    ngOnInit(): void {
        this.checkboxPeople$ = combineLatest([
            this.people$.asObservable(),
            this.selectedIds$,
        ]).pipe(
            map(([people, ids]) => {
                return people.map((p: any) => ({
                    ...p,
                    checked: ids.has(p.id),
                }));
            })
        );
    }

    checkedChange(e: CheckboxCustomEvent, person: CheckedboxMember): void {
        if (e.detail.checked === person.checked) return;

        if (e.detail.checked) this.selectedIds.add(e.detail.value);
        else this.selectedIds.delete(e.detail.value);

        this.onChange(Array.from(this.selectedIds));
        this.selectedIds$.next(this.selectedIds);
    }

    trackByFn(_index: number, person: CheckedboxMember): string {
        return person.id;
    }

    writeValue(value: string[]): void {
        this.selectedIds.clear();
        value.forEach((v) => {
            this.selectedIds.add(v);
        });
        this.selectedIds$.next(this.selectedIds);
    }

    registerOnChange(fn: (value: string[]) => void): void {
        this.onChange = fn;
    }
    registerOnTouched(): void {}
}
