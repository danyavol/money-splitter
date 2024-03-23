import { Component } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { SettingsService } from 'src/app/core/services/settings.service';
import { DatabaseService } from 'src/app/database/database.service';
import { Theme } from 'src/app/database/storage.interface';

@Component({
    selector: 'app-settings-shell',
    templateUrl: './settings-shell.component.html',
    styleUrls: ['./settings-shell.component.scss'],
})
export class SettingsShellComponent {
    readonly Theme = Theme;

    settingsForm = this.settingsService.settingsForm;

    userData$ = this.authService.getCurrentUserData();
    userPreferences$ = this.authService.getCurrentUserPreferences();
    userPhotoUrl$ = this.userData$.pipe(
        switchMap(user => {
            if (!user?.photo) return of(null);

            return this.db.getUserPhoto(user.userId, user.photo)
        })
    );

    constructor(
        private settingsService: SettingsService,
        private authService: AuthService,
        private db: DatabaseService
    ) {}

    signOut() {
        this.authService.signOut().subscribe();
    }
}
