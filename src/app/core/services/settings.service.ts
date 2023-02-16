import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import {
    defaultSettings,
    SettingsCollection,
} from 'src/app/database/collections/settings.collection';
import { Theme } from 'src/app/database/storage.interface';

export interface SettingsForm {
    theme: FormControl<Theme>;
}

@Injectable({
    providedIn: 'root',
})
export class SettingsService {
    settingsForm = new FormGroup<SettingsForm>({
        theme: new FormControl(defaultSettings.theme, { nonNullable: true }),
    });

    // Use matchMedia to check the user preference
    private prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    private systemIsDark = this.prefersDark.matches;
    private ignoreNextSave = false;

    constructor(private settingsCol: SettingsCollection) {
        this.applySettingsHandlers();
        this.saveSettingsHandler();

        this.loadSettings();

        // Listen for changes to the prefers-color-scheme media query
        this.prefersDark.addListener((mediaQuery) => {
            this.systemIsDark = mediaQuery.matches;
        });
    }

    private loadSettings(): void {
        this.settingsCol.settings$.subscribe((settings) => {
            this.ignoreNextSave = true;
            this.settingsForm.setValue({
                theme: settings.theme,
            });
            this.ignoreNextSave = false;
        });
    }

    private applySettingsHandlers(): void {
        this.settingsForm.controls.theme.valueChanges.subscribe(
            (currentTheme) => {
                switch (currentTheme) {
                    case Theme.System:
                        toggleDarkTheme(this.systemIsDark);
                        break;
                    case Theme.Dark:
                        toggleDarkTheme(true);
                        break;
                    case Theme.Light:
                        toggleDarkTheme(false);
                        break;
                }
            }
        );

        function toggleDarkTheme(isDark: boolean): void {
            if (isDark) {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
        }
    }

    private saveSettingsHandler() {
        this.settingsForm.valueChanges
            .pipe(
                filter(() => !this.ignoreNextSave),
                switchMap((settings) =>
                    this.settingsCol.updateSettings(settings)
                )
            )
            .subscribe();
    }
}
