import { AbstractControl } from '@angular/forms';
import { defer, startWith } from 'rxjs';

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

export function formatFileSize(bytes: number) {
    const kilobyteSize = 1024
    const megabyteSize = kilobyteSize ** 2;

    if (bytes < kilobyteSize) {
        return `${bytes} bytes`;
    } else if (bytes < megabyteSize) {
        return `${(bytes / kilobyteSize).toFixed(1)} KB`;
    } else {
        return `${(bytes / megabyteSize).toFixed(1)} MB`;
    }
}
