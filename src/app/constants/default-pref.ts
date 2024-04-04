import { Theme } from "../database/storage.interface";
import { UserPreferences } from "../types/user.type";

export function getDefaultPreferences(): UserPreferences {
    return {
        theme: Theme.System,
        recentCurrencies: []
    };
}
