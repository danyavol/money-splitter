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
import { Collection, Member } from '../storage.interface';
import { LocalStorageService } from '../local-storage.service';
import { GroupsCollection } from './groups.collection';

@Injectable({
    providedIn: 'root',
})
export class MembersCollection {
    private membersSbj = new ReplaySubject<Member[]>(1);
    members$ = this.membersSbj.asObservable();

    constructor(
        private storage: LocalStorageService,
        private groupsCol: GroupsCollection
    ) {
        this.loadMembers();
    }

    createMember(member: Omit<Member, 'id'>): Observable<void> {
        const newMember: Member = { ...member, id: uuid() };

        return this.members$.pipe(
            first(),
            map((members) => [newMember, ...members]),
            switchMap((newMembers) =>
                this.saveMembers(newMembers).pipe(
                    tap(() => this.membersSbj.next(newMembers))
                )
            )
        );
    }

    getGroupMembers(groupId: string): Observable<Member[]> {
        return combineLatest([
            this.members$,
            this.groupsCol.groups$
        ]).pipe(
            map(([members, groups]) => {
                const group = groups.find(g => g.id === groupId);
                if (!group) throw new Error(`Group not found. Id: ${groupId}`);

                return members.filter(m => group.members.includes(m.id));
            })
        );
    }

    getMember(memberId: string): Observable<Member | null> {
        return this.members$.pipe(
            first(),
            map((members) => members.find((m) => m.id === memberId) || null)
        );
    }

    updateMember(memberId: string, member: Partial<Member>): Observable<void> {
        return this.members$.pipe(
            first(),
            map((members) => {
                const memberIndex = members.findIndex((m) => m.id === memberId);
                if (memberIndex < 0) return;

                members.splice(memberIndex, 1, {
                    ...members[memberIndex],
                    ...member,
                });
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

    removeMember(memberId: string): Observable<void> {
        return this.groupsCol.groups$.pipe(
            tap((groups) => {
                const memberGroups = groups.filter(group => group.members.includes(memberId));
                if (memberGroups.length) {
                    const groupNames = memberGroups.map(g => `<strong>${g.name}</strong>`).join(', ') + '.'
                    throw new Error("Error! This person is a member of:<br><br>" + groupNames);
                }
            }),
            switchMap(() => this.members$),
            first(),
            map((members) => {
                const memberIndex = members.findIndex((m) => m.id === memberId);
                if (memberIndex < 0) return;

                members.splice(memberIndex, 1);
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
        this.storage.refresh$.pipe(
            startWith(undefined),
            switchMap(() => this.storage.get<Member[]>(Collection.Members))
        ).subscribe(members => {
            this.membersSbj.next(members || []);
        });
    }

    private saveMembers(members: Member[]): Observable<void> {
        return this.storage.set(Collection.Members, members);
    }
}
