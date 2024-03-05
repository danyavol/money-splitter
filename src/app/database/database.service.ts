import { Injectable, inject } from "@angular/core";
import { Firestore, collection, collectionData } from "@angular/fire/firestore";
import { ExtendedCurrency } from "../types/currency.type";
import { Observable, from, map, share, shareReplay } from "rxjs";
import { getDownloadURL, getMetadata, ref, Storage } from "@angular/fire/storage";

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    firestore = inject(Firestore);
    storage = inject(Storage);

    currencies$ = (
        collectionData(collection(this.firestore, 'currencies'), { idField: 'code' }) as Observable<ExtendedCurrency[]>
    ).pipe(
        map(currencies => {
            getMetadata(ref(this.storage, `currencies/USD.svg`))
                .then((metadata) => {
                    console.log(metadata);
                });
            return currencies.map(c => {
                return {...c, iconUrl$: from(getDownloadURL(ref(this.storage, `currencies/${c.icon}`)))}
            })
        }),
        shareReplay()
    );
}
