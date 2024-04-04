import { Injectable, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';
import { BehaviorSubject, filter, switchMap } from 'rxjs';
import { Theme } from 'src/app/database/storage.interface';
import { SafeArea, SafeAreaInsets } from 'capacitor-plugin-safe-area';
import { isPlatform } from '@ionic/angular';
import { ActivatedRouteSnapshot, ResolveEnd, Router } from '@angular/router';
import { DatabaseService } from 'src/app/database/database.service';
import { getDefaultPreferences } from 'src/app/constants/default-pref';

export interface SettingsForm {
    theme: FormControl<Theme>;
}

@Injectable({
    providedIn: 'root',
})
export class SettingsService {
    settingsForm = new FormGroup<SettingsForm>({
        theme: new FormControl(getDefaultPreferences().theme, { nonNullable: true }),
    });

    showTabs = new BehaviorSubject(true);

    // Use matchMedia to check the user preference
    private prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    private systemIsDark = this.prefersDark.matches;
    private ignoreNextSave = false;

    private db = inject(DatabaseService);

    constructor(
        private router: Router
    ) {
        this.applySettingsHandlers();
        this.saveSettingsHandler();

        this.loadSettings();

        // Listen for changes to the prefers-color-scheme media query
        this.prefersDark.addListener((mediaQuery) => {
            this.systemIsDark = mediaQuery.matches;
        });


        if (isPlatform('capacitor')) StatusBar.setOverlaysWebView({ overlay: true });
        NavigationBar.setTransparency({ isTransparent: true });

        SafeArea.getSafeAreaInsets().then(this.updateSafeArea);
        SafeArea.addListener('safeAreaChanged', this.updateSafeArea);

        this.router.events.subscribe(data => {
            if (data instanceof ResolveEnd) {
                const route = getLastChild(data.state.root);

                this.updateShowTabs(!route.data['hideTabs']);
            }
            function getLastChild(snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
                return snapshot.firstChild ? getLastChild(snapshot.firstChild) : snapshot;
            }
        })
    }

    private loadSettings(): void {
        this.db.getUserPreferences().subscribe((settings) => {
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
                if (isPlatform('capacitor')) StatusBar.setStyle({ style: Style.Dark });
            } else {
                document.body.classList.remove('dark');
                if (isPlatform('capacitor')) StatusBar.setStyle({ style: Style.Light });
            }
        }
    }

    private saveSettingsHandler() {
        this.settingsForm.valueChanges
            .pipe(
                filter(() => !this.ignoreNextSave),
                switchMap((settings) =>
                    this.db.updateUserPreferences(settings)
                )
            )
            .subscribe();
    }

    private updateSafeArea({ insets }: SafeAreaInsets) {
        for (const [key, value] of Object.entries(insets)) {
            document.documentElement.style.setProperty(
            `--ion-safe-area-${key}`,
            `${value}px`,
            );
        }
    }

    private updateShowTabs(show: boolean) {
        if (this.showTabs.value !== show) {
            this.showTabs.next(show);
        }
    }
}
