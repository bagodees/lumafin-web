import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemFilter } from '@jellyfin/sdk/lib/generated-client/models/item-filter';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import type { ApiClient } from 'jellyfin-apiclient';
import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';
import escapeHtml from 'escape-html';

import globalize from 'lib/globalize';

import type { SectionOptions } from './section';
import { getApi, queryClient, renderGridSectionWithTitleText } from './utils/gridSection';

/**
 * Picks a "seed" item to base similar-item recommendations on: the most
 * recently watched movie or series (using the series itself, not a
 * specific episode, for episode seeds).
 */
async function getSeedItem(apiClient: ApiClient) {
    const api = getApi(apiClient);
    const userId = apiClient.getCurrentUserId();
    const params = {
        userId,
        recursive: true,
        filters: [ ItemFilter.IsPlayed ],
        includeItemTypes: [ BaseItemKind.Movie, BaseItemKind.Episode ],
        sortBy: [ ItemSortBy.DatePlayed ],
        sortOrder: [ SortOrder.Descending ],
        limit: 1,
        enableTotalRecordCount: false
    };

    const result = await queryClient.fetchQuery({
        queryKey: [ 'User', userId, 'BecauseYouWatchedSeed', params ],
        queryFn: () => getLibraryApi(api).getItems(params).then(r => r.data)
    });

    const item = result.Items?.[0];
    if (!item) return null;

    if (item.Type === BaseItemKind.Episode && item.SeriesId) {
        return { id: item.SeriesId, name: item.SeriesName ?? '' };
    }

    return { id: item.Id ?? '', name: item.Name ?? '' };
}

export async function loadBecauseYouWatched(
    elem: HTMLElement,
    apiClient: ApiClient,
    options: SectionOptions
) {
    const seed = await getSeedItem(apiClient);
    if (!seed?.id) {
        elem.innerHTML = '';
        return;
    }

    const titleText = globalize.translate('HeaderBecauseYouWatched', escapeHtml(seed.name));

    renderGridSectionWithTitleText(elem, titleText, () => {
        const api = getApi(apiClient);
        const userId = apiClient.getCurrentUserId();
        const params = {
            itemId: seed.id,
            userId,
            limit: options.enableOverflow ? 20 : 16,
            fields: [ ItemFields.PrimaryImageAspectRatio ]
        };

        return queryClient.fetchQuery({
            queryKey: [ 'User', userId, 'BecauseYouWatched', params ],
            queryFn: () => getLibraryApi(api).getSimilarItems(params).then(r => r.data)
        });
    }, options);
}
