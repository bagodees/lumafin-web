import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';
import type { ApiClient } from 'jellyfin-apiclient';

import { HomeSectionType } from 'constants/homeSectionType';

import type { SectionOptions } from './section';
import { getApi, queryClient, renderGridSection } from './utils/gridSection';

// Matches LumaFin-AndroidTV's HomeFragmentHelper limits.
const ITEM_LIMIT = 50;

/**
 * "added": sorted by date added to the library (Recently Added X).
 * "release": sorted by release date, newest first, excluding anything that
 * has not premiered yet (Latest X).
 */
type SortMode = 'added' | 'release';

interface TypedSectionConfig {
    titleKey: string;
    itemType: BaseItemKind;
    mode: SortMode;
}

const TYPED_SECTIONS: Record<string, TypedSectionConfig> = {
    [HomeSectionType.RecentlyAddedMovies]: { titleKey: 'HomeSectionRecentlyAddedMovies', itemType: BaseItemKind.Movie, mode: 'added' },
    [HomeSectionType.RecentlyAddedShows]: { titleKey: 'HomeSectionRecentlyAddedShows', itemType: BaseItemKind.Series, mode: 'added' },
    [HomeSectionType.RecentlyAddedAlbums]: { titleKey: 'HomeSectionRecentlyAddedAlbums', itemType: BaseItemKind.MusicAlbum, mode: 'added' },
    [HomeSectionType.RecentlyAddedArtists]: { titleKey: 'HomeSectionRecentlyAddedArtists', itemType: BaseItemKind.MusicArtist, mode: 'added' },
    [HomeSectionType.RecentlyAddedMusicVideos]: { titleKey: 'HomeSectionRecentlyAddedMusicVideos', itemType: BaseItemKind.MusicVideo, mode: 'added' },
    [HomeSectionType.RecentlyAddedBooks]: { titleKey: 'HomeSectionRecentlyAddedBooks', itemType: BaseItemKind.Book, mode: 'added' },
    [HomeSectionType.RecentlyAddedAudiobooks]: { titleKey: 'HomeSectionRecentlyAddedAudiobooks', itemType: BaseItemKind.AudioBook, mode: 'added' },
    [HomeSectionType.LatestAlbums]: { titleKey: 'HomeSectionLatestAlbums', itemType: BaseItemKind.MusicAlbum, mode: 'release' },
    [HomeSectionType.LatestMusicVideos]: { titleKey: 'HomeSectionLatestMusicVideos', itemType: BaseItemKind.MusicVideo, mode: 'release' },
    [HomeSectionType.LatestBooks]: { titleKey: 'HomeSectionLatestBooks', itemType: BaseItemKind.Book, mode: 'release' },
    [HomeSectionType.LatestAudiobooks]: { titleKey: 'HomeSectionLatestAudiobooks', itemType: BaseItemKind.AudioBook, mode: 'release' }
};

export function isTypedSection(section: string) {
    return Object.prototype.hasOwnProperty.call(TYPED_SECTIONS, section);
}

export function loadTypedSection(
    section: string,
    elem: HTMLElement,
    apiClient: ApiClient,
    options: SectionOptions
) {
    const config = TYPED_SECTIONS[section];

    renderGridSection(elem, config.titleKey, () => {
        const api = getApi(apiClient);
        const userId = apiClient.getCurrentUserId();
        const isRelease = config.mode === 'release';
        const params = {
            userId,
            includeItemTypes: [ config.itemType ],
            recursive: true,
            // Skip items that have not premiered yet - otherwise anything
            // with a future date lands at the top of a newest-first sort.
            maxPremiereDate: isRelease ? new Date().toISOString() : undefined,
            sortBy: [ isRelease ? ItemSortBy.PremiereDate : ItemSortBy.DateCreated ],
            sortOrder: [ SortOrder.Descending ],
            limit: ITEM_LIMIT,
            fields: [ ItemFields.PrimaryImageAspectRatio ],
            enableTotalRecordCount: false
        };

        return queryClient.fetchQuery({
            queryKey: [ 'User', userId, 'HomeTypedSection', section, params ],
            queryFn: () => getLibraryApi(api).getItems(params).then(r => r.data)
        });
    }, options);
}
