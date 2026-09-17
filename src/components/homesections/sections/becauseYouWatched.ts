import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models/base-item-dto';
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

// Matches jellyfin-plugin-home-sections' BecauseYouWatchedSection: up to 5
// rows, one per distinct recently-watched title.
const MAX_ROWS = 5;
// Larger than the plugin's 15 - episodes collapse down to their series, so a
// bigger sample gives a better chance of finding MAX_ROWS distinct titles.
const SEED_POOL_SIZE = 50;

interface Seed {
    id: string;
    name: string;
}

function shuffle<T>(items: T[]): T[] {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
    }
    return copy;
}

/**
 * Resolves an item to the thing a "Because You Watched" row should actually
 * be seeded/titled from: the series itself (not a specific episode) for
 * episode seeds.
 */
function resolveSeed(item: BaseItemDto): Seed {
    if (item.Type === BaseItemKind.Episode && item.SeriesId) {
        return { id: item.SeriesId, name: item.SeriesName ?? '' };
    }

    return { id: item.Id ?? '', name: item.Name ?? '' };
}

async function getSeedPool(apiClient: ApiClient) {
    const api = getApi(apiClient);
    const userId = apiClient.getCurrentUserId();
    const params = {
        userId,
        recursive: true,
        filters: [ ItemFilter.IsPlayed ],
        includeItemTypes: [ BaseItemKind.Movie, BaseItemKind.Episode ],
        sortBy: [ ItemSortBy.DatePlayed, ItemSortBy.Random ],
        sortOrder: [ SortOrder.Descending, SortOrder.Descending ],
        limit: SEED_POOL_SIZE,
        enableTotalRecordCount: false
    };

    const result = await queryClient.fetchQuery({
        queryKey: [ 'User', userId, 'BecauseYouWatchedPool', params ],
        queryFn: () => getLibraryApi(api).getItems(params).then(r => r.data)
    });

    return shuffle(result.Items ?? []);
}

export async function loadBecauseYouWatched(
    elem: HTMLElement,
    apiClient: ApiClient,
    options: SectionOptions
) {
    const pool = await getSeedPool(apiClient);

    // Pick up to MAX_ROWS distinct seed titles - dedup by resolved id, so an
    // episode and its series (or the same title appearing twice in the
    // shuffled pool) only ever produce one row, never a repeated title.
    const seen = new Set<string>();
    const seeds: Seed[] = [];
    for (const item of pool) {
        const seed = resolveSeed(item);
        if (!seed.id || seen.has(seed.id)) continue;
        seen.add(seed.id);
        seeds.push(seed);
        if (seeds.length >= MAX_ROWS) break;
    }

    if (!seeds.length) {
        elem.innerHTML = '';
        return;
    }

    elem.innerHTML = '';
    for (const seed of seeds) {
        const rowElem = document.createElement('div');
        rowElem.classList.add('verticalSection');
        elem.appendChild(rowElem);

        const titleText = globalize.translate('HeaderBecauseYouWatched', escapeHtml(seed.name));

        renderGridSectionWithTitleText(rowElem, titleText, () => {
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
}
