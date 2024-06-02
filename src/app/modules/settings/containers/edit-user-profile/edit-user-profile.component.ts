import { Component, OnInit, inject } from '@angular/core';
import { getUserProfileForm } from './user-profile-form.config';
import { ActivatedRoute } from '@angular/router';
import { UserProfileFormValue } from './user-profile-form.interface';
import { DatabaseService } from 'src/app/database/database.service';

@Component({
    selector: 'app-edit-user-profile',
    templateUrl: './edit-user-profile.component.html',
    styleUrls: ['./edit-user-profile.component.scss'],
})
export class EditUserProfileComponent implements OnInit {
    route = inject(ActivatedRoute);
    db = inject(DatabaseService);
    form = getUserProfileForm(this.getDefaultFormValue());


    constructor() {
        console.log(this.route.snapshot.data);
    }

    ngOnInit() {

    }

    saveProfile() {
        // this.db.updateUser(this.form.value)
    }

    getDefaultFormValue(): UserProfileFormValue {
        return {
            photo: this.route.snapshot.data['userPhoto'],
            name: this.route.snapshot.data['userData'].name,
        };
    }
}
