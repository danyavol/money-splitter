import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';

/**
 * If you firstly created an account using email and password,
 * and then logged in via Google linked to the same email,
 * your first account will be merged with the new account and now you will only be able
 * to log in via Google.
 */

@Component({
  selector: 'app-singin-email',
  templateUrl: './singin-email.component.html',
  styleUrls: ['./singin-email.component.scss'],
})
export class SinginEmailComponent  implements OnInit {

    constructor(private authService: AuthService) {

        this.authService.lastRequestedSignInMethod;
    }

    ngOnInit() {}

}
