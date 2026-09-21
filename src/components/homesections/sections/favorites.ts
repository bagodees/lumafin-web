import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemFilter } from '@jellyfin/sdk/lib/generated-client/models/item-filter';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';
import type { ApiClient } from 'jellyfin-apiclient';

import type { SectionOptions } from './section';
import { getApi, queryClient, renderGridSection } from './utils/gridSection';

export function loadFavorites(
    elem: HTMLElement,
    apiClient: ApiClient,
    options: SectionOptions
) {
    renderGridSection(elem, 'HomeSectionFavorites', () => {
        const api = getApi(apiClient);
        const userId = apiClient.getCurrentUserId();
        // Same item types and ordering as LumaFin-AndroidTV's Favorites row.
        const params = {
            userId,
            includeItemTypes: [
                BaseItemKind.Movie,
                BaseItemKind.Series,
                BaseItemKind.Episode,
                BaseItemKind.MusicAlbum,
                BaseItemKind.MusicArtist
            ],
            recursive: true,
            filters: [ ItemFilter.IsFavorite ],
            sortBy: [ ItemSortBy.SortName ],
            sortOrder: [ SortOrder.Ascending ],
            limit: 50,
            fields: [ ItemFields.PrimaryImageAspectRatio ],
            enableTotalRecordCount: false
        };

        return queryClient.fetchQuery({
            queryKey: [ 'User', userId, 'HomeFavorites', params ],
            queryFn: () => getLibraryApi(api).getItems(params).then(r => r.data)
        });
    }, options);
}
