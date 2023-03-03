import { Component } from '@angular/core';
import { SettingsService } from 'src/app/core/services/settings.service';
import { BackupsService } from 'src/app/database/backups.service';
import { Theme } from 'src/app/database/storage.interface';

@Component({
    selector: 'app-settings-shell',
    templateUrl: './settings-shell.component.html',
    styleUrls: ['./settings-shell.component.scss'],
})
export class SettingsShellComponent {
    readonly Theme = Theme;

    settingsForm = this.settingsService.settingsForm;

    constructor(
        private settingsService: SettingsService,
        private backups: BackupsService
    ) {}

    saveBackup() {
        this.backups.saveBackup().subscribe();
    }

    applyBackup() {
        this.backups.applyBackup();
    }
}
