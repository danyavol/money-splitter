import { Injectable } from '@angular/core';
import {
    combineLatest,
    first,
    map,
    Observable,
    of,
    ReplaySubject,
    startWith,
    switchMap,
    tap
} from 'rxjs';
import { v4 as uuid } from 'uuid';
import { FullTransfer } from '../storage-join.interface';
import { Collection, Transfer } from '../storage.interface';
import { StorageService } from '../storage.service';
import { MembersCollection } from './members.collection';

@Injectable({
    providedIn: 'root',
})
export class TransfersCollection {
    private transferSbj = new ReplaySubject<Transfer[]>(1);
    transfers$ = this.transferSbj.asObservable();

    constructor(private storage: StorageService, private membersCol: MembersCollection) {
        this.loadTransfers();
    }

    createTransfer(transfer: Omit<Transfer, 'id'>): Observable<void> {
        const newTransfer: Transfer = { ...transfer, id: uuid() };

        return this.transfers$.pipe(
            first(),
            map((transfers) => [...transfers, newTransfer]),
            switchMap((newTransfers) =>
                this.saveTransfers(newTransfers).pipe(
                    tap(() => this.transferSbj.next(newTransfers))
                )
            )
        );
    }

    getTransfer(transferId: string): Observable<Transfer | null> {
        return this.transfers$.pipe(
            first(),
            map(
                (transfers) =>
                    transfers.find((t) => t.id === transferId) || null
            )
        );
    }

    getFullTransfers(groupId: string): Observable<FullTransfer[]> {
        return combineLatest([
            this.transfers$.pipe(
                map((transfers) => transfers.filter((t) => t.groupId === groupId))
            ),
            this.membersCol.members$,
        ]).pipe(
            map(([transfers, members]) =>
                transfers.map((t) => ({
                    ...t,
                    sender: members.find(m => m.id === t.senderId)?.name || "",
                    recipient: members.find(m => m.id === t.recipientId)?.name || "",
                }))
            )
        );
    }

    updateTransfer(
        transferId: string,
        transfer: Partial<Transfer>
    ): Observable<void> {
        return this.transfers$.pipe(
            first(),
            map((transfers) => {
                const transferIndex = transfers.findIndex(
                    (t) => t.id === transferId
                );
                if (transferIndex < 0) return;

                transfers.splice(transferIndex, 1, {
                    ...transfers[transferIndex],
                    ...transfer,
                });
                return transfers;
            }),
            switchMap((newTransfers) => {
                if (!newTransfers) return of();

                return this.saveTransfers(newTransfers).pipe(
                    tap(() => this.transferSbj.next(newTransfers))
                );
            })
        );
    }

    removeTransfer(transferId: string): Observable<void> {
        return this.transfers$.pipe(
            first(),
            map((transfers) => {
                const transferIndex = transfers.findIndex(
                    (t) => t.id === transferId
                );
                if (transferIndex < 0) return;

                transfers.splice(transferIndex, 1);
                return transfers;
            }),
            switchMap((newTransfers) => {
                if (!newTransfers) return of();

                return this.saveTransfers(newTransfers).pipe(
                    tap(() => this.transferSbj.next(newTransfers))
                );
            })
        );
    }

    private loadTransfers(): void {
        this.storage.refresh$
            .pipe(
                startWith(undefined),
                switchMap(() =>
                    this.storage.get<Transfer[]>(Collection.Transfers)
                )
            )
            .subscribe((transfers) => {
                this.transferSbj.next(transfers || []);
            });
    }

    private saveTransfers(transfers: Transfer[]): Observable<void> {
        return this.storage.set(Collection.Transfers, transfers);
    }
}
