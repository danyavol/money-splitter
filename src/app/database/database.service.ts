import { Injectable, inject } from "@angular/core";
import { Firestore, collection, collectionData, doc, docData, setDoc, updateDoc } from "@angular/fire/firestore";
import { Storage, UploadResult, getBlob, ref, uploadBytes, deleteObject } from "@angular/fire/storage";
import { isEqual, update } from 'lodash-es';
import mime from "mime";
import { Observable, combineLatest, defer, distinctUntilChanged, filter, first, from, map, of, shareReplay, switchMap } from "rxjs";
import { ExtendedCurrency } from "../types/currency.type";
import { User, UserPreferences, UserWithId } from "../types/user.type";
import { CURRENT_USER } from "../core/services/current-user.injector";
import { notNull } from "../core/helpers/not-null";

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    firestore = inject(Firestore);
    storage = inject(Storage);
    currentUser$$ = inject(CURRENT_USER);

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

    getCurrentUser() {
        return this.getUserId().pipe(
            switchMap(userId => from(docData(doc(this.firestore, 'users', userId), { idField: 'userId' }) as Observable<UserWithId>))
        )
    }

    updateUser(data: Partial<User>): Observable<void> {
        return this.getUserId().pipe(
            switchMap(userId => from(updateDoc(doc(this.firestore, 'users', userId), data)))
        );
    }

    getUserPreferences(): Observable<UserPreferences> {
        return this.getUserId().pipe(
            switchMap(userId => from(docData(doc(this.firestore, 'users', userId, 'settings', 'preferences')) as Observable<UserPreferences>))
        );
    }

    setUser(data: User): Observable<void> {
        return this.getUserId().pipe(
            switchMap(userId => from(setDoc(doc(this.firestore, 'users', userId), data)))
        );
    }

    setUserPreferences(data: UserPreferences): Observable<void> {
        return this.getUserId().pipe(
            switchMap(userId => from(setDoc(doc(this.firestore, 'users', userId, 'settings', 'preferences'), data)))
        );
    }

    updateUserPreferences(data: Partial<UserPreferences>): Observable<void> {
        return this.getUserId().pipe(
            switchMap(userId => from(updateDoc(doc(this.firestore, 'users', userId, 'settings', 'preferences'), data)))
        );
    }

    private getUserId(): Observable<string> {
        return this.currentUser$$.pipe(
            filter(notNull),
            map(user => user.uid),
            first()
        );
    }
}
