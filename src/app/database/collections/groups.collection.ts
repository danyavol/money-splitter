import { Injectable } from "@angular/core";
import { first, map, Observable, of, ReplaySubject, startWith, switchMap, tap } from "rxjs";
import { v4 as uuid } from "uuid";
import { Collection, Group } from "../storage.interface";
import { StorageService } from "../storage.service";

@Injectable({
    providedIn: "root"
})
export class GroupsCollection {
    private groupsSbj = new ReplaySubject<Group[]>(1);
    groups$ = this.groupsSbj.asObservable();

    constructor(private storage: StorageService) {
        this.loadGroups();
    }

    createGroup(group: Omit<Group, "id">): Observable<string> {
        const newGroup: Group = { ...group, id: uuid() };

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
            first(),
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
                });
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

    private loadGroups(): void {
        this.storage.refresh$.pipe(
            startWith(undefined),
            switchMap(() => this.storage.get<Group[]>(Collection.Groups))
        ).subscribe(groups => {
            this.groupsSbj.next(groups || []);
        });
    }

    private saveGroups(groups: Group[]): Observable<void> {
        return this.storage.set(Collection.Groups, groups);
    }
}
