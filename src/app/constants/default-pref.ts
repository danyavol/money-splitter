import { UserPreferences } from "../types/user.type";

export function getDefaultPreferences(): UserPreferences {
    return {
        theme: 'system',
        recentCurrencies: []
    };
}
