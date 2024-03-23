import { Injectable, inject } from "@angular/core";
import { Firestore, collection, collectionData } from "@angular/fire/firestore";
import { ExtendedCurrency } from "../types/currency.type";
import { Observable, defer, distinctUntilChanged, from, map, shareReplay, tap } from "rxjs";
import { getBlob, ref, Storage } from "@angular/fire/storage";
import { isEqual } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    firestore = inject(Firestore);
    storage = inject(Storage);

    currencies$ = (
        collectionData(collection(this.firestore, 'currencies'), { idField: 'code' }) as Observable<ExtendedCurrency[]>
    ).pipe(
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
        map(currencies => {
            return currencies.map(c => {
                return {
                    ...c,
                    iconUrl$: from(getBlob(ref(this.storage, `currencies/${c.icon}`)).then(blob => URL.createObjectURL(blob))).pipe(
                        shareReplay(1)
                    )
                }
            })
        }),
        shareReplay(1),
    );
}
