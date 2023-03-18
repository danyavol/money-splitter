import { AbstractControl } from "@angular/forms";
import { defer, startWith } from "rxjs";

export function sortByDate<T extends { date: string }>(array: T[]): T[] {
    const newArray = [...array];
    return newArray.sort((a, b) => {
        if (a.date === b.date) return 0;
        if (a.date < b.date) return 1;
        return -1;
    });
}

export function instantChanges<T>(control: AbstractControl<T>) {
    return defer(() => control.valueChanges.pipe(startWith(control.value)));
}
