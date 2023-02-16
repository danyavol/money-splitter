import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';
import { SettingsCollection } from 'src/app/database/collections/settings.collection';
import { Settings, Theme } from 'src/app/database/storage.interface';

interface SettingsForm {
    theme: FormControl<Theme>;
}

@Component({
    selector: 'app-settings-shell',
    templateUrl: './settings-shell.component.html',
    styleUrls: ['./settings-shell.component.scss'],
})
export class SettingsShellComponent {
    readonly Theme = Theme;

    // Use matchMedia to check the user preference
    prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    isDarkSystemTheme = this.prefersDark.matches;

    settingsForm?: FormGroup<SettingsForm>;

    constructor(
        private settingsCol: SettingsCollection
    ) {
        this.loadStorageSettings();

        // Listen for changes to the prefers-color-scheme media query
        this.prefersDark.addListener((mediaQuery) => {
            this.isDarkSystemTheme = mediaQuery.matches;
        });
    }

    // Add or remove the "dark" class based on if the media query matches
    private toggleDarkTheme(isDark: boolean): void {
        if (isDark) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }

    private loadStorageSettings(): void {
        this.settingsCol.settings$.subscribe((settings) => {
            if (!this.settingsForm) {
                this.settingsForm = this.createSettingsForm(settings);
                this.handleFormValueChanges(this.settingsForm);
                this.saveFormValue(this.settingsForm);
            } else {
                this.settingsForm.setValue({
                    theme: settings.theme
                });
            }
        });
    }

    private createSettingsForm(settings: Settings): FormGroup<SettingsForm> {
        return new FormGroup({
            theme: new FormControl(settings.theme, { nonNullable: true })
        });
    }

    private handleFormValueChanges(form: FormGroup<SettingsForm>): void {
        form.controls.theme.valueChanges.pipe(startWith(form.controls.theme.value)).subscribe((currentTheme) => {
            switch(currentTheme) {
                case Theme.System:
                    this.toggleDarkTheme(this.isDarkSystemTheme);
                    break;
                case Theme.Dark:
                    this.toggleDarkTheme(true);
                    break;
                case Theme.Light:
                    this.toggleDarkTheme(false);
                    break;
            }
        });
    }

    private saveFormValue(form: FormGroup<SettingsForm>) {
        form.valueChanges.pipe(
            switchMap(settings => this.settingsCol.updateSettings(settings))
        ).subscribe();
    }
}
