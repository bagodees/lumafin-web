import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemFilter } from '@jellyfin/sdk/lib/generated-client/models/item-filter';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import { MediaType } from '@jellyfin/sdk/lib/generated-client/models/media-type';
import { SortOrder } from '@jellyfin/sdk/lib/generated-client/models/sort-order';
import type { ApiClient } from 'jellyfin-apiclient';
import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';

import type { SectionOptions } from './section';
import { getApi, queryClient, renderGridSection } from './utils/gridSection';

export function loadWatchAgain(
    elem: HTMLElement,
    apiClient: ApiClient,
    options: SectionOptions
) {
    renderGridSection(elem, 'HeaderWatchAgain', () => {
        const api = getApi(apiClient);
        const userId = apiClient.getCurrentUserId();
        const params = {
            userId,
            recursive: true,
            filters: [ ItemFilter.IsPlayed ],
            mediaTypes: [ MediaType.Video ],
            sortBy: [ ItemSortBy.DatePlayed ],
            sortOrder: [ SortOrder.Descending ],
            limit: options.enableOverflow ? 20 : 16,
            fields: [ ItemFields.PrimaryImageAspectRatio ],
            enableTotalRecordCount: false
        };

        return queryClient.fetchQuery({
            queryKey: [ 'User', userId, 'WatchAgain', params ],
            queryFn: () => getLibraryApi(api).getItems(params).then(r => r.data)
        });
    }, options);
}
