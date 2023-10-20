import { Component, ElementRef, ViewChild } from '@angular/core';
import { first } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
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

    @ViewChild("inputFile") inputFile?: ElementRef;

    settingsForm = this.settingsService.settingsForm;

    constructor(
        private settingsService: SettingsService,
        private backups: BackupsService,
        private authService: AuthService
    ) {}

    saveBackup() {
        this.backups.saveBackup().pipe(first()).subscribe();
    }

    applyBackup(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files ? target.files[0] : null;
        if (!file) return;

        target.value = "";

        this.backups.applyBackup(file).pipe(first()).subscribe();
    }

    selectFile() {
        this.inputFile?.nativeElement.click();
    }

    signOut() {
        this.authService.signOut().subscribe();
    }
}
