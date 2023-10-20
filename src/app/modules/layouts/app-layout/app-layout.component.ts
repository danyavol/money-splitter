import { Component, OnInit } from '@angular/core';
import { ViewDidEnter, ViewDidLeave } from '@ionic/angular';

@Component({
    selector: 'app-app-layout',
    templateUrl: './app-layout.component.html',
    styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent implements ViewDidEnter, ViewDidLeave {
    ionTabsDisplay: 'flex' | 'none' = 'flex';

    ionViewDidEnter() {
        console.log('ionViewDidEnter');
        this.ionTabsDisplay = 'flex';
    }

    ionViewDidLeave() {
        console.log('ionViewDidLeave');
        this.ionTabsDisplay = 'none';
    }
}
