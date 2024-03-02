import { Component, inject } from '@angular/core';
import { SettingsService } from 'src/app/core/services/settings.service';

@Component({
    selector: 'app-app-layout',
    templateUrl: './app-layout.component.html',
    styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent {
    showTabs$ = inject(SettingsService).showTabs.asObservable();
}
