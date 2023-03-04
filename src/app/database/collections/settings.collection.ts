import { Injectable } from "@angular/core";
import { first, map, Observable, ReplaySubject, startWith, switchMap, tap } from "rxjs";
import { Collection, Settings, Theme } from "../storage.interface";
import { StorageService } from "../storage.service";

export const defaultSettings: Settings = {
    theme: Theme.System
};

@Injectable({
    providedIn: "root"
})
export class SettingsCollection {
    private settingsSbj = new ReplaySubject<Settings>(1);
    settings$ = this.settingsSbj.asObservable();

    constructor(private storage: StorageService) {
        this.loadSettings();
    }

    updateSettings(settings: Partial<Settings>): Observable<void> {
        return this.settings$.pipe(
            first(),
            map((oldSettings) => {
                return { ...oldSettings, ...settings };
            }),
            switchMap((newSettings) => {
                return this.saveSettings(newSettings).pipe(
                    tap(() => this.settingsSbj.next(newSettings))
                );
            })
        );
    }

    private loadSettings(): void {
        this.storage.refresh$.pipe(
            startWith(undefined),
            switchMap(() => this.storage.get<Settings>(Collection.Settings))
        ).subscribe(settings => {
            this.settingsSbj.next(settings || defaultSettings);
        });
    }

    private saveSettings(settings: Settings): Observable<void> {
        return this.storage.set(Collection.Settings, settings);
    }
}
