import { Injectable } from "@angular/core";
import { first, map, Observable, of, ReplaySubject, startWith, switchMap, tap } from "rxjs";
import { DateHelper } from "src/app/core/helpers/date-helper";
import { v4 as uuid } from "uuid";
import { Collection, Group } from "../storage.interface";
import { LocalStorageService } from "../local-storage.service";

@Injectable({
    providedIn: "root"
})
export class GroupsCollection {
    private groupsSbj = new ReplaySubject<Group[]>(1);
    groups$ = this.groupsSbj.asObservable();

    constructor(private storage: LocalStorageService) {
        this.loadGroups();
    }

    getSortedGroups(): Observable<Group[]> {
        return this.groups$.pipe(
            map(groups => groups.sort((a, b) => {
                if (a.updatedAt < b.updatedAt) return 1;
                else if (a.updatedAt > b.updatedAt) return -1;
                return 0;
            }))
        );
    }

    createGroup(group: Omit<Group, "id" | "updatedAt">): Observable<string> {
        const newGroup: Group = { ...group, id: uuid(), updatedAt: DateHelper.getUtcTimestamp() };

        return this.groups$.pipe(
            first(),
            map(groups => ([...groups, newGroup])),
            switchMap(newGroups => this.saveGroups(newGroups).pipe(
                tap(() => this.groupsSbj.next(newGroups)),
                map(() => newGroup.id)
            ))
        );
    }

    getGroup(groupId: string): Observable<Group | null> {
        return this.groups$.pipe(
            map((groups) => groups.find((g) => g.id === groupId) || null)
        );
    }

    updateGroup(groupId: string, group: Partial<Group>): Observable<void> {
        return this.groups$.pipe(
            first(),
            map((groups) => {
                const groupIndex = groups.findIndex((g) => g.id === groupId);
                if (groupIndex < 0) return;

                groups.splice(groupIndex, 1, {
                    ...groups[groupIndex],
                    ...group,
                    updatedAt: DateHelper.getUtcTimestamp()
                });
                return groups;
            }),
            switchMap((newGroups) => {
                if (!newGroups) return of();

                return this.saveGroups(newGroups).pipe(
                    tap(() => this.groupsSbj.next(newGroups))
                );
            }),
            tap(() => {})
        );
    }

    removeGroup(groupId: string): Observable<void> {
        return this.groups$.pipe(
            first(),
            map((groups) => {
                const groupIndex = groups.findIndex((g) => g.id === groupId);
                if (groupIndex < 0) return;

                groups.splice(groupIndex, 1);
                return groups;
            }),
            switchMap((newGroups) => {
                if (!newGroups) return of();

                return this.saveGroups(newGroups).pipe(
                    tap(() => this.groupsSbj.next(newGroups))
                );
            })
        );
    }

    groupHasUpdated(groupId: string): Observable<void> {
        return this.groups$.pipe(
            first(),
            map((groups) => {
                const groupIndex = groups.findIndex((g) => g.id === groupId);
                if (groupIndex < 0) return;

                groups.splice(groupIndex, 1, {
                    ...groups[groupIndex],
                    updatedAt: DateHelper.getUtcTimestamp()
                });
                return groups;
            }),
            switchMap((newGroups) => {
                if (!newGroups) return of();

                return this.saveGroups(newGroups).pipe(
                    tap(() => this.groupsSbj.next(newGroups))
                );
            })
        )
    }

    private loadGroups(): void {
        this.storage.get<Group[]>(Collection.Groups)
            .subscribe(groups => {
                this.groupsSbj.next(groups || []);
            });
    }

    private saveGroups(groups: Group[]): Observable<void> {
        return this.storage.set(Collection.Groups, groups);
    }
}
