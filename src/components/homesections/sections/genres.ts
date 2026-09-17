import { BaseItemKind } from '@jellyfin/sdk/lib/generated-client/models/base-item-kind';
import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models/base-item-dto';
import { ItemFields } from '@jellyfin/sdk/lib/generated-client/models/item-fields';
import { ItemSortBy } from '@jellyfin/sdk/lib/generated-client/models/item-sort-by';
import type { ApiClient } from 'jellyfin-apiclient';
import { getGenreApi } from '@jellyfin/sdk/lib/utils/api/genre-api';
import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';

import cardBuilder from 'components/cardbuilder/cardBuilder';
import { getBackdropShape } from 'components/cardbuilder/utils/shape';
import globalize from 'lib/globalize';
import ServerConnections from 'lib/jellyfin-apiclient/ServerConnections';
import { queryClient } from 'utils/query/queryClient';
import type { ItemDto } from 'types/base/models/item-dto';

import type { SectionContainerElement, SectionOptions } from './section';

export function loadGenres(
    elem: HTMLElement,
    apiClient: ApiClient,
    options: SectionOptions
) {
    let html = '';

    html += '<h2 class="sectionTitle sectionTitle-cards padded-left">' + globalize.translate('Genres') + '</h2>';
    if (options.enableOverflow) {
        html += '<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-centerfocus="true">';
        html += '<div is="emby-itemscontainer" class="itemsContainer scrollSlider focuscontainer-x">';
    } else {
        html += '<div is="emby-itemscontainer" class="itemsContainer padded-left padded-right focuscontainer-x vertical-wrap">';
    }

    if (options.enableOverflow) {
        html += '</div>';
    }
    html += '</div>';

    elem.classList.add('hide');
    elem.innerHTML = html;

    const itemsContainer: SectionContainerElement | null = elem.querySelector('.itemsContainer');
    if (!itemsContainer) return;

    // NOTE: fetchData resolves to genre items with their PrimaryImageTag/
    // PrimaryImageItemId overridden to point at one random item from that
    // genre (instead of the server's own auto-generated genre thumbnail,
    // which repeats items - and looks like duplicates - for genres with few
    // items). This reuses cardBuilder's normal, proven single-image
    // rendering instead of a bespoke multi-poster layout.
    const fetchGenreCards = async () => {
        const api = ServerConnections.getApi(apiClient.serverId());
        const userId = apiClient.getCurrentUserId();
        const genresParams = {
            userId,
            sortBy: [ ItemSortBy.SortName ],
            enableTotalRecordCount: false
        };

        const genresResult = await queryClient.fetchQuery({
            queryKey: [ 'User', userId, 'HomeGenres', genresParams ],
            queryFn: () => getGenreApi(api!).getGenres(genresParams).then(r => r.data)
        });

        const genres = genresResult.Items ?? [];
        const withArt: ItemDto[] = [];

        for (const genre of genres) {
            if (!genre.Id) continue;

            const itemsParams = {
                userId,
                genreIds: [ genre.Id ],
                includeItemTypes: [ BaseItemKind.Movie, BaseItemKind.Series ],
                recursive: true,
                sortBy: [ ItemSortBy.Random ],
                limit: 1,
                fields: [ ItemFields.PrimaryImageAspectRatio ],
                enableTotalRecordCount: false
            };

            const itemsResult = await queryClient.fetchQuery({
                queryKey: [ 'User', userId, 'GenrePoster', itemsParams ],
                queryFn: () => getLibraryApi(api!).getItems(itemsParams).then(r => r.data)
            });

            const source = itemsResult.Items?.[0];
            if (!source?.Id || !source.ImageTags?.Primary) continue;

            withArt.push({
                ...genre,
                // Clear the genre's own auto-generated composite image (and
                // any other image-tag fields) so getCardImageUrl's priority
                // chain falls through to the PrimaryImageTag/PrimaryImageItemId
                // override below instead of picking the composite first.
                ImageTags: undefined,
                BackdropImageTags: undefined,
                SeriesPrimaryImageTag: undefined,
                ParentPrimaryImageTag: undefined,
                ParentBackdropImageTags: undefined,
                PrimaryImageTag: source.ImageTags.Primary,
                PrimaryImageItemId: source.Id,
                PrimaryImageAspectRatio: source.PrimaryImageAspectRatio
            });
        }

        return withArt;
    };
    itemsContainer.fetchData = fetchGenreCards as unknown as SectionContainerElement['fetchData'];

    itemsContainer.getItemsHtml = (items: BaseItemDto[]) => cardBuilder.getCardsHtml({
        items,
        shape: getBackdropShape(options.enableOverflow),
        showTitle: true,
        centerText: true,
        overlayText: false,
        lazy: true,
        allowBottomPadding: !options.enableOverflow,
        context: 'home'
    });
    itemsContainer.parentContainer = elem;
}
