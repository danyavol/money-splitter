import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { BehaviorSubject, filter, first, from, map, Observable, switchMap } from 'rxjs';
import { Collection } from './storage.interface';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private storageReady = new BehaviorSubject(false);

    constructor(
        private storage: Storage
    ) {
        this.init();
    }

    async init() {
        await this.storage.defineDriver(CordovaSQLiteDriver);
        await this.storage.create();
        this.storageReady.next(true);
    }

    public set<T>(collection: Collection, value: T): Observable<void> {
        return this.storageReady.pipe(
            filter(ready => ready),
            switchMap(() => from(this.storage.set(collection, value)).pipe(
                map(() => undefined)
            )),
            first()
        );
    }

    public get<T>(collection: Collection): Observable<T | undefined> {
        return this.storageReady.pipe(
            filter(ready => ready),
            switchMap(() => from(this.storage.get(collection))),
            first()
        );
    }

    public remove(collection: Collection): Observable<void> {
        return this.storageReady.pipe(
            filter(ready => ready),
            switchMap(() => from(this.storage.remove(collection))),
            first()
        );
    }

    public clearStorage(): Observable<void> {
        return this.storageReady.pipe(
            filter(ready => ready),
            switchMap(() => from(this.storage.clear())),
            first()
        );
    }

    public getAll(): Observable<{[key: string]: any}> {
        return this.storageReady.pipe(
            filter(ready => ready),
            switchMap(() => {
                const allData: any = {};
                return from(this.storage.forEach((value, key) => {
                    allData[key] = value;
                })).pipe(map(() => allData));
            }),
            first()
        );
    }
}
