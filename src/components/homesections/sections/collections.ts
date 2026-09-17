import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models/base-item-dto';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import type { ApiClient } from 'jellyfin-apiclient';
import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';

import type { SectionOptions } from './section';
import { getApi, queryClient, renderGridSection } from './utils/gridSection';

const EXCLUDED_COLLECTION_TYPES = [ 'playlists', 'livetv', 'boxsets', 'channels' ];

export function loadCollections(
    elem: HTMLElement,
    apiClient: ApiClient,
    userViews: BaseItemDto[],
    options: SectionOptions
) {
    // NOTE: box sets aren't reliably found by a single global recursive
    // search - the stock "Collections" library tab always scopes its query
    // to a specific library's parentId (see apps/legacy/controllers/movies/
    // moviecollections.js), so mirror that here across every library and
    // merge/dedupe the results into one row.
    const libraryViews = userViews.filter(v =>
        v.Id && !EXCLUDED_COLLECTION_TYPES.includes(v.CollectionType ?? '')
    );

    renderGridSection(elem, 'Collections', async () => {
        const api = getApi(apiClient);
        const userId = apiClient.getCurrentUserId();

        const resultsPerLibrary = await Promise.all(libraryViews.map(view => {
            const params = {
                userId,
                parentId: view.Id,
                includeItemTypes: [ BaseItemKind.BoxSet ],
                recursive: true,
                // Matches jellyfin-plugin-home-sections' CollectionsSection:
                // surface the most recently-updated collections first.
                sortBy: [ ItemSortBy.DateLastContentAdded ],
                sortOrder: [ SortOrder.Descending ],
                fields: [ ItemFields.PrimaryImageAspectRatio, ItemFields.DateCreated ],
                enableTotalRecordCount: false
            };

            return queryClient.fetchQuery({
                queryKey: [ 'User', userId, 'HomeCollections', params ],
                queryFn: () => getLibraryApi(api).getItems(params).then(r => r.data.Items ?? [])
            });
        }));

        // NOTE: avoid Array.prototype.flat() - not supported on the older
        // WebKit engine used by Tizen TVs.
        const seen = new Set<string>();
        const merged: BaseItemDto[] = [];
        for (const items of resultsPerLibrary) {
            for (const item of items) {
                if (item.Id && !seen.has(item.Id)) {
                    seen.add(item.Id);
                    merged.push(item);
                }
            }
        }
        merged.sort((a, b) => {
            const dateA = a.DateLastMediaAdded ?? '';
            const dateB = b.DateLastMediaAdded ?? '';
            return dateB.localeCompare(dateA);
        });

        return merged.slice(0, options.enableOverflow ? 20 : 16);
    }, options);
}
