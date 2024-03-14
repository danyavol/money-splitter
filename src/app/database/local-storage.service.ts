import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import {
    first,
    forkJoin,
    from,
    map,
    Observable,
    ReplaySubject,
    Subscriber,
    switchMap,
    tap,
} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    private storageReady = new ReplaySubject<void>(1);
    private watchers = new Map<string | symbol, Subscriber<any>[]>();

    private readonly ALL_STORAGE = Symbol();

    constructor(private storage: Storage) {
        this.init();
    }

    public set<T>(key: string, value: T): Observable<void> {
        return this.storageReady.pipe(
            switchMap(() => from(this.storage.set(key, value))),
            tap(() => { this.notifyStorageWatchers(key); }),
            map(() => undefined),
            first()
        );
    }

    public get<T>(key: string): Observable<T | undefined> {
        return this.storageReady.pipe(
            switchMap(() => this.getStorageWatcher(key)),
            switchMap(() => from(this.storage.get(key)))
        );
    }

    public remove(key: string): Observable<void> {
        return this.storageReady.pipe(
            switchMap(() => from(this.storage.remove(key))),
            tap(() => { this.notifyStorageWatchers(key); }),
            first()
        );
    }

    public setAll<T>(data: { [key: string]: T }): Observable<void> {
        return this.storageReady.pipe(
            switchMap(() => this.clearStorage()),
            switchMap(() => {
                const observables: Observable<void>[] = [];
                for (let key in data) {
                    observables.push(from(this.storage.set(key, data[key])));
                }

                return forkJoin(observables);
            }),
            tap(() => { this.notifyStorageWatchers(this.ALL_STORAGE); }),
            map(() => undefined),
            first()
        );
    }

    public getAll<T>(): Observable<{ [key: string]: T }> {
        return this.storageReady.pipe(
            switchMap(() => this.getStorageWatcher(this.ALL_STORAGE)),
            switchMap(() => {
                const allData: any = {};
                return from(
                    this.storage.forEach((value, key) => {
                        allData[key] = value;
                    })
                ).pipe(map(() => allData));
            }),
        );
    }

    public getKeys(): Observable<string[]> {
        return this.storageReady.pipe(
            switchMap(() => from(this.storage.keys())),
            first()
        );
    }

    private clearStorage(): Observable<void> {
        return this.storageReady.pipe(
            switchMap(() => from(this.storage.clear())),
            first()
        );
    }

    private async init() {
        await this.storage.create();
        this.storageReady.next();
    }

    private notifyStorageWatchers(key: string | symbol): void {
        // Global storage getting notified every time
        const globalSubs = this.watchers.get(this.ALL_STORAGE) || [];

        // Check to avoid duplicated emits
        const subs = key !== this.ALL_STORAGE ? this.watchers.get(key) || [] : [];

        [...subs, ...globalSubs].forEach(sub => sub.next());
    }

    // You can create a subscription to get notification whenever someone
    // Writes to storage
    private getStorageWatcher(key: string | symbol): Observable<void> {
        return new Observable(subscriber => {
            // Add subscriber to subscribers array
            const array = this.watchers.get(key) || [];
            this.watchers.set(key, [...array, subscriber]);

            // Immediately emit value for new subscriber
            subscriber.next();


            return () => {
                subscriber.complete();
                subscriber.closed = true;

                // Remove a subscriber from subscribers array
                const array = this.watchers.get(key);
                if (!array) return;

                // Find index of subscriber
                const index = array.findIndex(s => s === subscriber);
                if (index === -1) return;

                // Remove whole array if this is the only subscriber in array
                if (array.length === 1) {
                    this.watchers.delete(key);
                    return;
                }

                // Remove only this subscriber from array,
                const newArray = [...array];
                newArray.splice(index, 1);
                this.watchers.set(key, newArray)
            }
        });
    }
}
