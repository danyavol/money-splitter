import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/core/services/settings.service';
import { Theme } from 'src/app/database/storage.interface';

@Component({
    selector: 'app-style-guide',
    templateUrl: './style-guide.component.html',
    styleUrls: ['./style-guide.component.scss'],
})
export class StyleGuideComponent implements OnInit {
    Theme = Theme;
    settingsForm = this.settingsService.settingsForm;

    constructor(private settingsService: SettingsService) {}

    ngOnInit() {}
}
