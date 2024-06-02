import { NgModule, inject } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsShellComponent } from './settings-shell/settings-shell.component';
import { EditUserProfileComponent } from './containers/edit-user-profile/edit-user-profile.component';
import { DatabaseService } from 'src/app/database/database.service';
import { UserPhotoDatabase } from 'src/app/database/user-photo.database';

const routes: Routes = [
    {
        path: '',
        component: SettingsShellComponent,
    },
    {
        path: 'edit',
        component: EditUserProfileComponent,
        resolve: {
            userData: () => inject(DatabaseService).getCurrentUser(),
            userPhoto: () => {
                const db = inject(UserPhotoDatabase);
                return db.getCurrentUserPhotoUrl();
            }

        },
        data: {
            hideTabs: true,
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SettingsRoutingModule {}
