import { Injectable, inject } from "@angular/core";
import { Firestore, collection, collectionData, doc, docData, setDoc } from "@angular/fire/firestore";
import { Storage, UploadResult, getBlob, ref, uploadBytes } from "@angular/fire/storage";
import { isEqual } from 'lodash-es';
import mime from "mime";
import { Observable, defer, distinctUntilChanged, from, map, shareReplay } from "rxjs";
import { ExtendedCurrency } from "../types/currency.type";
import { User, UserPreferences, UserWithId } from "../types/user.type";

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

    getUser(userId: string): Observable<UserWithId> {
        return defer(() => docData(doc(this.firestore, 'users', userId), { idField: 'userId' }) as Observable<UserWithId>)
    }

    getUserPreferences(userId: string): Observable<UserPreferences> {
        return defer(() => docData(doc(this.firestore, 'users', userId, 'settings', 'preferences')) as Observable<UserPreferences>)
    }

    setUser(userId: string, data: User): Observable<void> {
        return defer(() => setDoc(doc(this.firestore, 'users', userId), data));
    }

    setUserPreferences(userId: string, data: UserPreferences): Observable<void> {
        return defer(() => setDoc(doc(this.firestore, 'users', userId, 'settings', 'preferences'), data))
    }

    getUserPhotoFromUrl(url: string): Observable<{ blob: Blob, name: string }> {
        return defer(() => fetch(url).then(async d => {
            const ext = mime.getExtension(d.headers.get('Content-Type') || '');
            if (!ext) throw Error('Content-Type is not provided for profile photo');

            return { blob: await d.blob(), name: `profile-photo.${ext}` };
        }));
    }

    addUserPhoto(userId: string, fileName: string, data: Blob): Observable<UploadResult> {
        return defer(() => uploadBytes(ref(this.storage, `users/${userId}/${fileName}`), data));
    }

    getUserPhoto(userId: string, fileName: string) {
        return defer(() => getBlob(ref(this.storage, `users/${userId}/${fileName}`)).then(blob => URL.createObjectURL(blob)));
    }
}
