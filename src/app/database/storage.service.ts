import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import {
    BehaviorSubject,
    filter,
    first,
    forkJoin,
    from,
    map,
    Observable,
    Subject,
    switchMap,
    tap,
} from 'rxjs';
import { Collection } from './storage.interface';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    private storageReady = new BehaviorSubject(false);
    refresh$ = new Subject<void>(); // Emits when new data available in storage

    constructor(private storage: Storage) {
        this.init();
    }

    public set<T>(collection: Collection, value: T): Observable<void> {
        return this.storageReady.pipe(
            filter((ready) => ready),
            switchMap(() =>
                from(this.storage.set(collection, value)).pipe(
                    map(() => undefined)
                )
            ),
            first()
        );
    }

    public get<T>(collection: Collection): Observable<T | undefined> {
        return this.storageReady.pipe(
            filter((ready) => ready),
            switchMap(() => from(this.storage.get(collection))),
            first()
        );
    }

    public remove(collection: Collection): Observable<void> {
        return this.storageReady.pipe(
            filter((ready) => ready),
            switchMap(() => from(this.storage.remove(collection))),
            first()
        );
    }

    public setAll(data: { [key: string]: any }): Observable<void> {
        const observables: Observable<any>[] = [];
        for (let key in data) {
            observables.push(from(this.storage.set(key, data[key])));
        }

        return this.storageReady.pipe(
            filter((ready) => ready),
            switchMap(() => this.clearStorage()),
            switchMap(() => forkJoin(observables)),
            tap(() => this.refresh$.next()),
            map(() => undefined),
            first()
        );
    }

    public getAll(): Observable<{ [key: string]: any }> {
        return this.storageReady.pipe(
            filter((ready) => ready),
            switchMap(() => {
                const allData: any = {};
                return from(
                    this.storage.forEach((value, key) => {
                        allData[key] = value;
                    })
                ).pipe(map(() => allData));
            }),
            first()
        );
    }

    private clearStorage(): Observable<void> {
        return this.storageReady.pipe(
            filter((ready) => ready),
            switchMap(() => from(this.storage.clear())),
            first()
        );
    }

    private async init() {
        await this.storage.defineDriver(CordovaSQLiteDriver);
        await this.storage.create();
        this.storageReady.next(true);
    }
}
