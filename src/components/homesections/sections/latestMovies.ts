import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import type { ApiClient } from 'jellyfin-apiclient';
import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';

import type { SectionOptions } from './section';
import { getApi, queryClient, renderGridSection } from './utils/gridSection';

export function loadLatestMovies(
    elem: HTMLElement,
    apiClient: ApiClient,
    options: SectionOptions
) {
    renderGridSection(elem, 'HeaderLatestMoviesByRelease', () => {
        const api = getApi(apiClient);
        const userId = apiClient.getCurrentUserId();
        const params = {
            userId,
            includeItemTypes: [ BaseItemKind.Movie ],
            recursive: true,
            // Skip items that have not premiered yet (they'd sort to the top).
            maxPremiereDate: new Date().toISOString(),
            sortBy: [ ItemSortBy.PremiereDate ],
            sortOrder: [ SortOrder.Descending ],
            limit: options.enableOverflow ? 20 : 16,
            fields: [ ItemFields.PrimaryImageAspectRatio ],
            enableTotalRecordCount: false
        };

        return queryClient.fetchQuery({
            queryKey: [ 'User', userId, 'LatestMovies', params ],
            queryFn: () => getLibraryApi(api).getItems(params).then(r => r.data)
        });
    }, options);
}
