import { ALL_HOME_SECTION_TYPES } from 'constants/homeSectionMeta';
import { DEFAULT_SECTIONS, HomeSectionType } from 'constants/homeSectionType';

// LumaFin: home section layout as a single ordered list, matching
// LumaFin-AndroidTV's storage. Sections not listed are hidden - there's no
// fixed slot count and no explicit "None" entry. Kept local-only (like the
// old homesection0..9 keys) so a server-synced "shared display preferences"
// refresh can't silently revert it. See homesections.js for where this is read.
const STORAGE_KEY = 'lumafinHomeSectionOrder';
const OLD_SLOT_COUNT = 10;

function isValidType(value: string): value is HomeSectionType {
    return (ALL_HOME_SECTION_TYPES as string[]).includes(value);
}

function migrateFromOldSlots(userSettings: { get: (name: string, enableOnServer: boolean) => string }): HomeSectionType[] {
    const migrated: HomeSectionType[] = [];

    for (let i = 0; i < OLD_SLOT_COUNT; i++) {
        let value = userSettings.get(`homesection${i}`, false);
        if (!value) {
            value = DEFAULT_SECTIONS[i] ?? '';
        }
        if (value === 'folders') {
            value = DEFAULT_SECTIONS[0];
        }
        if (isValidType(value) && !migrated.includes(value)) {
            migrated.push(value);
        }
    }

    return migrated.length ? migrated : [...DEFAULT_SECTIONS];
}

export function getActiveHomeSections(userSettings: {
    get: (name: string, enableOnServer: boolean) => string,
    set: (name: string, value: string, enableOnServer: boolean) => void
}): HomeSectionType[] {
    const stored = userSettings.get(STORAGE_KEY, false);

    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                const filtered = parsed.filter((value): value is HomeSectionType => typeof value === 'string' && isValidType(value));
                // De-dupe defensively in case of a corrupted/hand-edited value.
                return [...new Set(filtered)];
            }
        } catch {
            // fall through to migration below
        }
    }

    const migrated = migrateFromOldSlots(userSettings);
    setActiveHomeSections(userSettings, migrated);
    return migrated;
}

export function setActiveHomeSections(userSettings: {
    set: (name: string, value: string, enableOnServer: boolean) => void
}, sections: HomeSectionType[]): void {
    userSettings.set(STORAGE_KEY, JSON.stringify(sections), false);
}
