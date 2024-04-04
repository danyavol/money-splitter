import { InjectionToken } from "@angular/core";
import { User } from "@angular/fire/auth";
import { ReplaySubject } from "rxjs";

export const CURRENT_USER = new InjectionToken<ReplaySubject<User | null>>('Current user', {
    providedIn: 'root',
    factory: () => new ReplaySubject<User | null>(1)
});
