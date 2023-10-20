import { inject } from "@angular/core";
import { CanMatchFn } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { map } from "rxjs";

export const authLayoutGuard: CanMatchFn = () => {
    return inject(AuthService).isLoggedIn.pipe(map(isLoggedIn => !isLoggedIn));
}

export const appLayoutGuard: CanMatchFn = () => {
    return inject(AuthService).isLoggedIn;
}
