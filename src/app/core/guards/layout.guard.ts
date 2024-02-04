import { inject } from "@angular/core";
import { CanMatchFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { map } from "rxjs";

export const authLayoutGuard: CanMatchFn = () => {
    const router = inject(Router);
    return inject(AuthService).isLoggedIn.pipe(map(isLoggedIn => {
        if (!isLoggedIn) return true;
        else return router.parseUrl('/app');
    }));
}

export const appLayoutGuard: CanMatchFn = () => {
    const router = inject(Router);
    return inject(AuthService).isLoggedIn.pipe(map(isLoggedIn => {
        if (isLoggedIn) return true;
        else return router.parseUrl('/auth');
    }));
}
