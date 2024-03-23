import { Injectable, inject } from "@angular/core";
import { Firestore, collection, collectionData, doc, setDoc } from "@angular/fire/firestore";
import { ExtendedCurrency } from "../types/currency.type";
import { Observable, defer, distinctUntilChanged, from, map, shareReplay, tap } from "rxjs";
import { getBlob, ref, Storage, uploadBytes } from "@angular/fire/storage";
import { isEqual } from 'lodash-es';
import mime from "mime";

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

    setUser(data: { userId: string, name: string | null, photo: string | null, email: string | null }) {
        return defer(() => setDoc(doc(this.firestore, 'users', data.userId), {
            name: data.name, email: data.email, photo: data.photo
        }));
    }

    getUserPhotoFromUrl(url: string): Observable<{ blob: Blob, name: string }> {
        return defer(() => fetch(url).then(async d => {
            const ext = mime.getExtension(d.headers.get('Content-Type') || '');
            if (!ext) throw Error('Content-Type is not provided for profile photo');

            return { blob: await d.blob(), name: `profile-photo.${ext}` };
        }));
    }

    addUserPhoto(userId: string, fileName: string, data: Blob) {
        return defer(() => uploadBytes(ref(this.storage, `users/${userId}/${fileName}`), data));
    }
}
