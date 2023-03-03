import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CheckboxCustomEvent, IonicModule } from '@ionic/angular';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Member } from 'src/app/database/storage.interface';

interface ViewMember extends Member {
    checked: boolean;
}

@Component({
    selector: 'app-select-person-modal',
    templateUrl: './select-person-modal.component.html',
    styleUrls: ['./select-person-modal.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: SelectPersonModalComponent,
        },
    ],
})
export class SelectPersonModalComponent implements OnInit, ControlValueAccessor {
    @Input() set people(people: Member[]) {
        this.people$.next(people);
    }

    @Output() close = new EventEmitter<void>();

    selectedIds = new Set<string>();
    selectedIds$ = new BehaviorSubject<Set<string>>(this.selectedIds);
    people$ = new BehaviorSubject<Member[]>([]);
    viewMembers$!: Observable<ViewMember[]>;

    onChange = (value: string[]) => {};
    onTouched = () => {};

    ngOnInit(): void {
        this.viewMembers$ = combineLatest([
            this.people$.asObservable(),
            this.selectedIds$,
        ]).pipe(
            map(([people, ids]) => {
                return people.map((p) => ({
                    ...p,
                    checked: ids.has(p.id),
                }));
            })
        );
    }

    checkedChange(e: CheckboxCustomEvent, person: ViewMember): void {
        if (e.detail.checked === person.checked) return;

        if (e.detail.checked) this.selectedIds.add(e.detail.value);
        else this.selectedIds.delete(e.detail.value);

        this.onTouched();
        this.onChange(this.sortSelectedIds(Array.from(this.selectedIds)));
        this.selectedIds$.next(this.selectedIds);
    }

    trackByFn(_index: number, person: ViewMember): string {
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
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    sortSelectedIds(ids: string[]): string[] {
        return this.people$.value
            .filter((p) => ids.includes(p.id))
            .map((p) => p.id);
    }
}
