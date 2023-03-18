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
import { DateHelper } from 'src/app/core/helpers/date-helper';
import { sortByDate } from 'src/app/core/helpers/helpers';
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

    getGroupTransfers(groupId: string): Observable<Transfer[]> {
        return this.transfers$.pipe(
            map((transfers) => transfers.filter((t) => t.groupId === groupId))
        );
    }

    getFullSortedTransfers(groupId: string): Observable<FullTransfer[]> {
        return combineLatest([
            this.getGroupTransfers(groupId),
            this.membersCol.members$,
        ]).pipe(
            map(([transfers, members]) =>
                transfers.map((t) => ({
                    ...t,
                    sender: members.find(m => m.id === t.senderId)?.name || "",
                    recipient: members.find(m => m.id === t.recipientId)?.name || "",
                }))
            ),
            map((transfers) => sortByDate(transfers))
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
                const mappedTransfers = (transfers || []).map((transfer) => ({
                    ...transfer,
                    date: DateHelper.utcToLocal(transfer.date),
                }));
                this.transferSbj.next(mappedTransfers);
            });
    }

    private saveTransfers(transfers: Transfer[]): Observable<void> {
        const mappedTransfers = transfers.map((transfer) => ({
            ...transfer,
            date: DateHelper.localToUtc(transfer.date),
        }));
        return this.storage.set(Collection.Transfers, mappedTransfers);
    }
}
