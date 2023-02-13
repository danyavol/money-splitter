import { Injectable } from '@angular/core';
import { first, map, Observable, of, ReplaySubject, switchMap, tap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { Collection, Member } from '../storage.interface';
import { StorageService } from '../storage.service';

@Injectable({
    providedIn: 'root',
})
export class MembersCollection {
    private membersSbj = new ReplaySubject<Member[]>(1);
    members$ = this.membersSbj.asObservable();

    constructor(private storage: StorageService) {
        this.loadMembers();
    }

    createMember(member: Omit<Member, 'id'>): Observable<void> {
        const newMember: Member = { ...member, id: uuid() };

        return this.members$.pipe(
            first(),
            map((members) => [...members, newMember]),
            switchMap((newMembers) =>
                this.saveMembers(newMembers).pipe(
                    tap(() => this.membersSbj.next(newMembers))
                )
            )
        );
    }

    getMember(memberId: string): Observable<Member | null> {
        return this.members$.pipe(
            first(),
            map((members) => members.find((m) => m.id === memberId) || null)
        );
    }

    updateMember(member: Member): Observable<void> {
        return this.members$.pipe(
            first(),
            map((members) => {
                const memberIndex = members.findIndex(
                    (m) => m.id === member.id
                );
                if (memberIndex < 0) return;

                members.splice(memberIndex, 1, member);
                return members;
            }),
            switchMap((newMembers) => {
                if (!newMembers) return of();

                return this.saveMembers(newMembers).pipe(
                    tap(() => this.membersSbj.next(newMembers))
                );
            })
        );
    }

    private loadMembers(): void {
        this.storage.get<Member[]>(Collection.Members).subscribe((members) => {
            this.membersSbj.next(members || []);
        });
    }

    private saveMembers(members: Member[]): Observable<void> {
        return this.storage.set(Collection.Members, members);
    }
}
