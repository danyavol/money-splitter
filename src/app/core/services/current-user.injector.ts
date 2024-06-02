import { InjectionToken, inject } from "@angular/core";
import { User } from "@angular/fire/auth";
import { Observable, ReplaySubject, filter, map } from "rxjs";
import { notNull } from "../helpers/not-null";

export const CURRENT_USER = new InjectionToken<ReplaySubject<User | null>>('Current user', {
    providedIn: 'root',
    factory: () => new ReplaySubject<User | null>(1)
});

export const CURRENT_USER_ID = new InjectionToken<Observable<string>>('Current user ID', {
    providedIn: 'root',
    factory: () => inject(CURRENT_USER).pipe(filter(notNull), map(u => u.uid))
});
