import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models/base-item-dto';
import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';
import { getShowApi } from '@jellyfin/sdk/lib/utils/api/show-api';
import type { ApiClient } from 'jellyfin-apiclient';

import type { SectionOptions } from './section';
import { getApi, queryClient, renderGridSection } from './utils/gridSection';

const ITEM_LIMIT = 50;

/**
 * One row combining Continue Watching and Next Up, like the plugin's
 * "Continue Watching / Next Up" section and LumaFin-AndroidTV. The two come
 * from different endpoints, so they're fetched concurrently and merged here
 * (resume items first, then next up, de-duplicated by id).
 */
export function loadContinueWatchingNextUp(
    elem: HTMLElement,
    apiClient: ApiClient,
    options: SectionOptions
) {
    renderGridSection(elem, 'HomeSectionContinueWatchingNextUp', async () => {
        const api = getApi(apiClient);
        const userId = apiClient.getCurrentUserId();

        const resumeParams = {
            userId,
            limit: ITEM_LIMIT,
            fields: [ ItemFields.PrimaryImageAspectRatio ],
            imageTypeLimit: 1,
            enableTotalRecordCount: false,
            excludeItemTypes: [ BaseItemKind.AudioBook ]
        };
        const nextUpParams = {
            userId,
            limit: ITEM_LIMIT,
            fields: [ ItemFields.PrimaryImageAspectRatio ],
            imageTypeLimit: 1,
            enableResumable: false,
            enableTotalRecordCount: false
        };

        // A failure in one endpoint shouldn't hide the other's results.
        const [ resume, nextUp ] = await Promise.all([
            queryClient.fetchQuery({
                queryKey: [ 'User', userId, 'HomeCwNuResume', resumeParams ],
                queryFn: () => getLibraryApi(api).getResumeItems(resumeParams).then(r => r.data.Items ?? [])
            }).catch(() => [] as BaseItemDto[]),
            queryClient.fetchQuery({
                queryKey: [ 'User', userId, 'HomeCwNuNextUp', nextUpParams ],
                queryFn: () => getShowApi(api).getNextUp(nextUpParams).then(r => r.data.Items ?? [])
            }).catch(() => [] as BaseItemDto[])
        ]);

        const seen = new Set<string>();
        const merged: BaseItemDto[] = [];
        for (const item of resume.concat(nextUp)) {
            if (item.Id && !seen.has(item.Id)) {
                seen.add(item.Id);
                merged.push(item);
            }
        }

        return merged;
    }, options);
}
