import { Component } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { SettingsService } from 'src/app/core/services/settings.service';
import { DatabaseService } from 'src/app/database/database.service';
import { Theme } from 'src/app/database/storage.interface';
import { UserPhotoDatabase } from 'src/app/database/user-photo.database';

@Component({
    selector: 'app-settings-shell',
    templateUrl: './settings-shell.component.html',
    styleUrls: ['./settings-shell.component.scss'],
})
export class SettingsShellComponent {
    readonly Theme = Theme;

    settingsForm = this.settingsService.settingsForm;

    userData$ = this.authService.getCurrentUserData();
    userPhotoUrl$ = this.db.getCurrentUserPhotoUrl();

    constructor(
        private settingsService: SettingsService,
        private authService: AuthService,
        private db: UserPhotoDatabase
    ) {}

    signOut() {
        this.authService.signOut().subscribe();
    }
}
