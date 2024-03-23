export type UserWithId = User & {
    userId: string;
}

export type User = {
    email: string;
    name: string;
    photo: string | null;
}

export type UserPreferences = {
    theme: 'system' | 'light' | 'dark';
    recentCurrencies: string[];
}
