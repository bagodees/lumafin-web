import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models/base-item-dto';
import type { ApiClient } from 'jellyfin-apiclient';

import cardBuilder from 'components/cardbuilder/cardBuilder';
import { getBackdropShape } from 'components/cardbuilder/utils/shape';
import globalize from 'lib/globalize';
import ServerConnections from 'lib/jellyfin-apiclient/ServerConnections';
import { queryClient } from 'utils/query/queryClient';

import type { SectionContainerElement, SectionOptions } from '../section';

/**
 * Renders a single-row home section: a title, an item-scroller container,
 * and lazy data-loading wired up via emby-itemscontainer's fetchData/getItemsHtml hooks.
 */
export function renderGridSection(
    elem: HTMLElement,
    titleLabel: string,
    fetchItems: () => Promise<BaseItemDto[] | { Items?: BaseItemDto[] }>,
    options: SectionOptions
) {
    renderGridSectionWithTitleText(elem, globalize.translate(titleLabel), fetchItems, options);
}

/**
 * Same as {@link renderGridSection}, but takes an already-resolved title
 * string instead of a translation key, for titles with dynamic content
 * (e.g. "Because You Watched {item name}").
 */
export function renderGridSectionWithTitleText(
    elem: HTMLElement,
    titleText: string,
    fetchItems: () => Promise<BaseItemDto[] | { Items?: BaseItemDto[] }>,
    options: SectionOptions
) {
    let html = '';

    html += '<h2 class="sectionTitle sectionTitle-cards padded-left">' + titleText + '</h2>';
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

    itemsContainer.fetchData = fetchItems;
    itemsContainer.getItemsHtml = (items: BaseItemDto[]) => cardBuilder.getCardsHtml({
        items,
        shape: getBackdropShape(options.enableOverflow),
        preferThumb: true,
        showTitle: true,
        showYear: true,
        showParentTitle: true,
        centerText: true,
        overlayText: false,
        overlayPlayButton: true,
        lazy: true,
        allowBottomPadding: !options.enableOverflow,
        context: 'home'
    });
    itemsContainer.parentContainer = elem;
}

export function getApi(apiClient: ApiClient) {
    // NOTE: non-null assertion matches the pattern used by the existing
    // section loaders (e.g. useLatestMedia.ts) - an ApiClient here always
    // has a connected Api instance.
    return ServerConnections.getApi(apiClient.serverId())!;
}

export { queryClient };
