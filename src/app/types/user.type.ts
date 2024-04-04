import { Theme } from "../database/storage.interface";

export type UserWithId = User & {
    userId: string;
}

export type User = {
    email: string;
    name: string;
    photo: string | null;
}

export type UserPreferences = {
    theme: Theme;
    recentCurrencies: string[];
}
