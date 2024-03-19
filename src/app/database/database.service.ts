import { Injectable, inject } from "@angular/core";
import { Firestore, collection, collectionData } from "@angular/fire/firestore";
import { ExtendedCurrency } from "../types/currency.type";
import { Observable, defer, map, shareReplay } from "rxjs";
import { getBlob, getMetadata, ref, Storage } from "@angular/fire/storage";

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    firestore = inject(Firestore);
    storage = inject(Storage);

    currencies$ = (
        collectionData(collection(this.firestore, 'currencies'), { idField: 'code' }) as Observable<ExtendedCurrency[]>
    ).pipe(
        map(currencies => {
            return currencies.map(c => {
                return {
                    ...c,
                    iconUrl$: defer(() => getBlob(ref(this.storage, `currencies/${c.icon}`))).pipe(
                        map(blob=> URL.createObjectURL(blob)),
                        shareReplay()
                    )
                }
            })
        }),
        shareReplay()
    );
}
