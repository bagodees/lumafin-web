
import escapeHtml from 'escape-html';

import { getUserViewsQuery } from 'hooks/api/useUserViews';
import { ServerConnections } from 'lib/jellyfin-apiclient';
import { queryClient } from 'utils/query/queryClient';

import layoutManager from '../layoutManager';
import focusManager from '../focusManager';
import globalize from '../../lib/globalize';
import loading from '../loading/loading';
import Events from '../../utils/events.ts';
import { getActiveHomeSections, setActiveHomeSections } from '../homesections/homeSectionOrder.ts';
import { ALL_HOME_SECTION_TYPES, HOME_SECTION_TITLE_KEYS } from '../../constants/homeSectionMeta.ts';
import dom from '../../utils/dom';
import '../listview/listview.scss';
import './homeScreenSettings.scss';
import '../../elements/emby-select/emby-select';
import '../../elements/emby-checkbox/emby-checkbox';
import toast from '../toast/toast';
import template from './homeScreenSettings.template.html';
import { LibraryTab } from '../../types/libraryTab.ts';

function renderViews(page, user, result) {
    let folderHtml = '';

    folderHtml += '<div class="checkboxList">';
    folderHtml += result.map(i => {
        let currentHtml = '';

        const id = `chkGroupFolder${i.Id}`;

        const isChecked = user.Configuration.GroupedFolders.includes(i.Id);

        const checkedHtml = isChecked ? ' checked="checked"' : '';

        currentHtml += '<label>';
        currentHtml += `<input type="checkbox" is="emby-checkbox" class="chkGroupFolder" data-folderid="${i.Id}" id="${id}"${checkedHtml}/>`;
        currentHtml += `<span>${escapeHtml(i.Name)}</span>`;
        currentHtml += '</label>';

        return currentHtml;
    }).join('');

    folderHtml += '</div>';

    page.querySelector('.folderGroupList').innerHTML = folderHtml;
}

function getLandingScreenOptions(type) {
    const list = [];

    if (type === 'movies') {
        list.push(
            {
                name: globalize.translate('Movies'),
                value: LibraryTab.Movies,
                isDefault: true
            },
            {
                name: globalize.translate('Suggestions'),
                value: LibraryTab.Suggestions
            },
            {
                name: globalize.translate('Favorites'),
                value: LibraryTab.Favorites
            },
            {
                name: globalize.translate('Collections'),
                value: LibraryTab.Collections
            },
            {
                name: globalize.translate('Genres'),
                value: LibraryTab.Genres
            },
            {
                name: globalize.translate('Studios'),
                value: LibraryTab.Studios
            },
            {
                name: globalize.translate('Playlists'),
                value: LibraryTab.Playlists
            }
        );
    } else if (type === 'tvshows') {
        list.push(
            {
                name: globalize.translate('Shows'),
                value: LibraryTab.Series,
                isDefault: true
            },
            {
                name: globalize.translate('Suggestions'),
                value: LibraryTab.Suggestions
            },
            {
                name: globalize.translate('TabUpcoming'),
                value: LibraryTab.Upcoming
            },
            {
                name: globalize.translate('Genres'),
                value: LibraryTab.Genres
            },
            {
                name: globalize.translate('Studios'),
                value: LibraryTab.Studios
            },
            {
                name: globalize.translate('Episodes'),
                value: LibraryTab.Episodes
            },
            {
                name: globalize.translate('Collections'),
                value: LibraryTab.Collections
            },
            {
                name: globalize.translate('Playlists'),
                value: LibraryTab.Playlists
            }
        );
    } else if (type === 'music') {
        list.push(
            {
                name: globalize.translate('Albums'),
                value: LibraryTab.Albums,
                isDefault: true
            },
            {
                name: globalize.translate('Suggestions'),
                value: LibraryTab.Suggestions
            },
            {
                name: globalize.translate('HeaderAlbumArtists'),
                value: LibraryTab.AlbumArtists
            },
            {
                name: globalize.translate('Artists'),
                value: LibraryTab.Artists
            },
            {
                name: globalize.translate('Playlists'),
                value: LibraryTab.Playlists
            },
            {
                name: globalize.translate('Songs'),
                value: LibraryTab.Songs
            },
            {
                name: globalize.translate('Genres'),
                value: LibraryTab.Genres
            },
            {
                name: globalize.translate('Collections'),
                value: LibraryTab.Collections
            }
        );
    } else if (type === 'livetv') {
        list.push(
            {
                name: globalize.translate('Programs'),
                value: LibraryTab.Programs,
                isDefault: true
            },
            {
                name: globalize.translate('Guide'),
                value: LibraryTab.Guide
            },
            {
                name: globalize.translate('Channels'),
                value: LibraryTab.Channels
            },
            {
                name: globalize.translate('Recordings'),
                value: LibraryTab.Recordings
            },
            {
                name: globalize.translate('Schedule'),
                value: LibraryTab.Schedule
            },
            {
                name: globalize.translate('Series'),
                value: LibraryTab.SeriesTimers
            }
        );
    } else if (type === 'homevideos') {
        list.push(
            {
                name: globalize.translate('Folders'),
                value: LibraryTab.Folders,
                isDefault: true
            },
            {
                name: globalize.translate('Photos'),
                value: LibraryTab.Photos
            },
            {
                name: globalize.translate('HeaderPhotoAlbums'),
                value: LibraryTab.PhotoAlbums
            },
            {
                name: globalize.translate('HeaderVideos'),
                value: LibraryTab.Videos
            }
        );
    } else if (type === 'musicvideos') {
        list.push(
            {
                name: globalize.translate('Folders'),
                value: LibraryTab.Folders,
                isDefault: true
            },
            {
                name: globalize.translate('Suggestions'),
                value: LibraryTab.Suggestions
            },
            {
                name: globalize.translate('HeaderVideos'),
                value: LibraryTab.MusicVideos
            },
            {
                name: globalize.translate('Playlists'),
                value: LibraryTab.Playlists
            }
        );
    } else if (type === 'mixed') {
        list.push(
            {
                name: globalize.translate('Folders'),
                value: LibraryTab.Folders,
                isDefault: true
            },
            {
                name: globalize.translate('Suggestions'),
                value: LibraryTab.Suggestions
            },
            {
                name: globalize.translate('HeaderMedia'),
                value: LibraryTab.Mixed
            },
            {
                name: globalize.translate('Collections'),
                value: LibraryTab.Collections
            },
            {
                name: globalize.translate('Playlists'),
                value: LibraryTab.Playlists
            }
        );
    } else if (type === 'books') {
        list.push(
            {
                name: globalize.translate('Folders'),
                value: LibraryTab.Folders,
                isDefault: true
            },
            {
                name: globalize.translate('Books'),
                value: LibraryTab.Books
            },
            {
                name: globalize.translate('Authors'),
                value: LibraryTab.Authors
            },
            {
                name: globalize.translate('Suggestions'),
                value: LibraryTab.Suggestions
            },
            {
                name: globalize.translate('Genres'),
                value: LibraryTab.Genres
            },
            {
                name: globalize.translate('Collections'),
                value: LibraryTab.Collections
            },
            {
                name: globalize.translate('Favorites'),
                value: LibraryTab.Favorites
            }
        );
    }

    return list;
}

function getLandingScreenOptionsHtml(type, userValue) {
    return getLandingScreenOptions(type).map(o => {
        const selected = userValue === o.value || (o.isDefault && !userValue);
        const selectedHtml = selected ? ' selected' : '';
        const optionValue = o.isDefault ? '' : o.value;

        return `<option value="${optionValue}"${selectedHtml}>${escapeHtml(o.name)}</option>`;
    }).join('');
}

function renderViewOrder(context, user, result) {
    let html = '';

    html += result.Items.map((view) => {
        let currentHtml = '';

        currentHtml += `<div class="listItem viewItem" data-viewid="${view.Id}">`;

        currentHtml += '<span class="material-icons listItemIcon folder_open" aria-hidden="true"></span>';

        currentHtml += '<div class="listItemBody">';

        currentHtml += '<div>';
        currentHtml += escapeHtml(view.Name);
        currentHtml += '</div>';

        currentHtml += '</div>';

        currentHtml += `<button type="button" is="paper-icon-button-light" class="btnViewItemUp btnViewItemMove autoSize" title="${globalize.translate('Up')}"><span class="material-icons keyboard_arrow_up" aria-hidden="true"></span></button>`;
        currentHtml += `<button type="button" is="paper-icon-button-light" class="btnViewItemDown btnViewItemMove autoSize" title="${globalize.translate('Down')}"><span class="material-icons keyboard_arrow_down" aria-hidden="true"></span></button>`;

        currentHtml += '</div>';

        return currentHtml;
    }).join('');

    context.querySelector('.viewOrderList').innerHTML = html;
}

function updateHomeSectionValues(context, userSettings) {
    context.querySelector('.selectTVHomeScreen').value = userSettings.get('tvhome') || '';
}

// LumaFin: a single toggleable/reorderable list of every home section type,
// replacing the old fixed 10-slot dropdown picker. Mirrors
// LumaFin-AndroidTV's SettingsHomeScreen: enabled sections shown in order at
// the top (with move up/down and a hide button), disabled ones listed below.
// Every change is persisted immediately, independent of the page's Save button.
function renderHomeSectionList(context, userSettings) {
    const listElem = context.querySelector('.lumafinHomeSectionList');

    function renderRows(activeList) {
        const hiddenList = ALL_HOME_SECTION_TYPES.filter(type => !activeList.includes(type));
        let html = '';

        html += activeList.map((type, index) => {
            const title = escapeHtml(globalize.translate(HOME_SECTION_TITLE_KEYS[type]));
            let row = `<div class="listItem lumafinSectionItem" data-type="${type}">`;
            row += '<span class="material-icons listItemIcon visibility" aria-hidden="true"></span>';
            row += `<div class="listItemBody"><div>${title}</div></div>`;
            row += `<button type="button" is="paper-icon-button-light" class="btnHomeSectionUp btnHomeSectionMove autoSize"${index === 0 ? ' disabled' : ''} title="${globalize.translate('Up')}"><span class="material-icons keyboard_arrow_up" aria-hidden="true"></span></button>`;
            row += `<button type="button" is="paper-icon-button-light" class="btnHomeSectionDown btnHomeSectionMove autoSize"${index === activeList.length - 1 ? ' disabled' : ''} title="${globalize.translate('Down')}"><span class="material-icons keyboard_arrow_down" aria-hidden="true"></span></button>`;
            row += `<button type="button" is="paper-icon-button-light" class="btnHomeSectionHide autoSize" title="${globalize.translate('HideSection')}"><span class="material-icons visibility_off" aria-hidden="true"></span></button>`;
            row += '</div>';
            return row;
        }).join('');

        if (hiddenList.length) {
            html += `<div class="lumafinSectionListHeading">${escapeHtml(globalize.translate('HeaderHiddenSections'))}</div>`;
            html += hiddenList.map(type => {
                const title = escapeHtml(globalize.translate(HOME_SECTION_TITLE_KEYS[type]));
                let row = `<div class="listItem lumafinSectionItem lumafinSectionItem-hidden" data-type="${type}">`;
                row += '<span class="material-icons listItemIcon visibility_off" aria-hidden="true"></span>';
                row += `<div class="listItemBody"><div>${title}</div></div>`;
                row += `<button type="button" is="paper-icon-button-light" class="btnHomeSectionShow autoSize" title="${globalize.translate('ShowSection')}"><span class="material-icons add" aria-hidden="true"></span></button>`;
                row += '</div>';
                return row;
            }).join('');
        }

        listElem.innerHTML = html;
    }

    function persistAndRerender(newActive, focusSelector) {
        setActiveHomeSections(userSettings, newActive);
        renderRows(newActive);
        const toFocus = focusSelector && listElem.querySelector(focusSelector);
        if (toFocus) focusManager.focus(toFocus);
    }

    renderRows(getActiveHomeSections(userSettings));

    listElem.addEventListener('click', e => {
        const item = dom.parentWithClass(e.target, 'lumafinSectionItem');
        if (!item) return;

        const type = item.getAttribute('data-type');
        const current = getActiveHomeSections(userSettings);

        if (dom.parentWithClass(e.target, 'btnHomeSectionUp')) {
            const idx = current.indexOf(type);
            if (idx > 0) {
                const next = [...current];
                [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                persistAndRerender(next, `[data-type="${type}"] .btnHomeSectionUp`);
            }
        } else if (dom.parentWithClass(e.target, 'btnHomeSectionDown')) {
            const idx = current.indexOf(type);
            if (idx >= 0 && idx < current.length - 1) {
                const next = [...current];
                [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                persistAndRerender(next, `[data-type="${type}"] .btnHomeSectionDown`);
            }
        } else if (dom.parentWithClass(e.target, 'btnHomeSectionHide')) {
            persistAndRerender(current.filter(t => t !== type), `[data-type="${type}"] .btnHomeSectionShow`);
        } else if (dom.parentWithClass(e.target, 'btnHomeSectionShow')) {
            persistAndRerender([...current, type], `[data-type="${type}"] .btnHomeSectionHide`);
        }
    });
}

function getPerLibrarySettingsHtml(item, user, userSettings) {
    const collectionType = (item.Type === 'CollectionFolder' && item.CollectionType == null) ? 'mixed' : item.CollectionType;

    let html = '';

    let isChecked;

    if (item.Type === 'Channel' || collectionType === 'boxsets' || collectionType === 'playlists') {
        isChecked = !(user.Configuration.MyMediaExcludes || []).includes(item.Id);
        html += '<div>';
        html += '<label>';
        html += `<input type="checkbox" is="emby-checkbox" class="chkIncludeInMyMedia" data-folderid="${item.Id}"${isChecked ? ' checked="checked"' : ''}/>`;
        html += `<span>${globalize.translate('DisplayInMyMedia')}</span>`;
        html += '</label>';
        html += '</div>';
    }

    const excludeFromLatest = ['playlists', 'livetv', 'boxsets', 'channels'];
    if (!excludeFromLatest.includes(collectionType || '')) {
        isChecked = !user.Configuration.LatestItemsExcludes.includes(item.Id);
        html += '<label class="fldIncludeInLatest">';
        html += `<input type="checkbox" is="emby-checkbox" class="chkIncludeInLatest" data-folderid="${item.Id}"${isChecked ? ' checked="checked"' : ''}/>`;
        html += `<span>${globalize.translate('DisplayInOtherHomeScreenSections')}</span>`;
        html += '</label>';
    }

    if (html) {
        html = `<div class="checkboxListContainer">${html}</div>`;
    }

    const landingScreenTypes = ['movies', 'tvshows', 'music', 'livetv', 'homevideos', 'musicvideos', 'mixed', 'books'];
    if (landingScreenTypes.includes(collectionType)) {
        const idForLanding = collectionType === 'livetv' ? collectionType : item.Id;
        html += '<div class="selectContainer">';
        html += `<select is="emby-select" class="selectLanding" data-folderid="${idForLanding}" label="${globalize.translate('LabelDefaultScreen')}">`;

        const userValue = userSettings.get(`landing-${idForLanding}`);

        html += getLandingScreenOptionsHtml(collectionType, userValue);

        html += '</select>';
        html += '</div>';
    }

    if (html) {
        let prefix = '';
        prefix += '<div class="verticalSection">';

        prefix += '<h2 class="sectionTitle">';
        prefix += escapeHtml(item.Name);
        prefix += '</h2>';

        html = prefix + html;
        html += '</div>';
    }

    return html;
}

function renderPerLibrarySettings(context, user, userViews, userSettings) {
    const elem = context.querySelector('.perLibrarySettings');
    let html = '';

    for (let i = 0, length = userViews.length; i < length; i++) {
        html += getPerLibrarySettingsHtml(userViews[i], user, userSettings);
    }

    elem.innerHTML = html;
}

function loadForm(context, user, userSettings, apiClient) {
    context.querySelector('.chkHidePlayedFromLatest').checked = user.Configuration.HidePlayedInLatest || false;

    updateHomeSectionValues(context, userSettings);
    renderHomeSectionList(context, userSettings);

    const promise1 = queryClient
        .fetchQuery(getUserViewsQuery(
            ServerConnections.getApi(apiClient.serverId()),
            {
                userId: user.Id,
                includeHidden: true
            }
        ));
    const promise2 = apiClient.getJSON(apiClient.getUrl(`Users/${user.Id}/GroupingOptions`));

    Promise.all([promise1, promise2]).then(responses => {
        renderViewOrder(context, user, responses[0]);

        renderPerLibrarySettings(context, user, responses[0].Items, userSettings);

        renderViews(context, user, responses[1]);

        loading.hide();
    });
}

function onSectionOrderListClick(e) {
    const target = dom.parentWithClass(e.target, 'btnViewItemMove');

    if (target) {
        const viewItem = dom.parentWithClass(target, 'viewItem');

        if (viewItem) {
            if (target.classList.contains('btnViewItemDown')) {
                const next = viewItem.nextSibling;

                if (next) {
                    viewItem.parentNode.removeChild(viewItem);
                    next.parentNode.insertBefore(viewItem, next.nextSibling);
                    focusManager.focus(e.target);
                }
            } else {
                const prev = viewItem.previousSibling;

                if (prev) {
                    viewItem.parentNode.removeChild(viewItem);
                    prev.parentNode.insertBefore(viewItem, prev);
                    focusManager.focus(e.target);
                }
            }
        }
    }
}

function getCheckboxItems(selector, context, isChecked) {
    const inputs = context.querySelectorAll(selector);
    const list = [];

    for (let i = 0, length = inputs.length; i < length; i++) {
        if (inputs[i].checked === isChecked) {
            list.push(inputs[i]);
        }
    }

    return list;
}

async function saveUser(context, user, userSettingsInstance, apiClient) {
    user.Configuration.HidePlayedInLatest = context.querySelector('.chkHidePlayedFromLatest').checked;

    user.Configuration.LatestItemsExcludes = getCheckboxItems('.chkIncludeInLatest', context, false).map(i => {
        return i.getAttribute('data-folderid');
    });

    user.Configuration.MyMediaExcludes = getCheckboxItems('.chkIncludeInMyMedia', context, false).map(i => {
        return i.getAttribute('data-folderid');
    });

    user.Configuration.GroupedFolders = getCheckboxItems('.chkGroupFolder', context, true).map(i => {
        return i.getAttribute('data-folderid');
    });

    const viewItems = context.querySelectorAll('.viewItem');
    const orderedViews = [];
    let i;
    let length;
    for (i = 0, length = viewItems.length; i < length; i++) {
        orderedViews.push(viewItems[i].getAttribute('data-viewid'));
    }

    user.Configuration.OrderedViews = orderedViews;

    userSettingsInstance.set('tvhome', context.querySelector('.selectTVHomeScreen').value);

    // LumaFin: home section layout (the toggle/reorder list) is persisted
    // immediately on every change by renderHomeSectionList, not here.

    const selectLandings = context.querySelectorAll('.selectLanding');
    for (i = 0, length = selectLandings.length; i < length; i++) {
        const selectLanding = selectLandings[i];
        userSettingsInstance.set(`landing-${selectLanding.getAttribute('data-folderid')}`, selectLanding.value);
    }

    await apiClient.updateUserConfiguration(user.Id, user.Configuration);
    // Invalidate all user queries
    void queryClient.invalidateQueries({
        queryKey: ['User', user.Id]
    });
}

function save(instance, context, userId, userSettings, apiClient, enableSaveConfirmation) {
    loading.show();

    apiClient.getUser(userId).then(user => {
        saveUser(context, user, userSettings, apiClient).then(() => {
            loading.hide();
            if (enableSaveConfirmation) {
                toast(globalize.translate('SettingsSaved'));
            }

            Events.trigger(instance, 'saved');
        }, () => {
            loading.hide();
        });
    });
}

function onSubmit(e) {
    const self = this;
    const apiClient = ServerConnections.getApiClient(self.options.serverId);
    const userId = self.options.userId;
    const userSettings = self.options.userSettings;

    userSettings.setUserInfo(userId, apiClient).then(() => {
        const enableSaveConfirmation = self.options.enableSaveConfirmation;
        save(self, self.options.element, userId, userSettings, apiClient, enableSaveConfirmation);
    });

    // Disable default form submission
    if (e) {
        e.preventDefault();
    }
    return false;
}

function onChange(e) {
    const chkIncludeInMyMedia = dom.parentWithClass(e.target, 'chkIncludeInMyMedia');
    if (!chkIncludeInMyMedia) {
        return;
    }

    const section = dom.parentWithClass(chkIncludeInMyMedia, 'verticalSection');
    const fldIncludeInLatest = section.querySelector('.fldIncludeInLatest');
    if (fldIncludeInLatest) {
        if (chkIncludeInMyMedia.checked) {
            fldIncludeInLatest.classList.remove('hide');
        } else {
            fldIncludeInLatest.classList.add('hide');
        }
    }
}

function embed(options, self) {
    options.element.innerHTML = globalize.translateHtml(template, 'core');

    options.element.querySelector('.viewOrderList').addEventListener('click', onSectionOrderListClick);
    options.element.querySelector('form').addEventListener('submit', onSubmit.bind(self));
    options.element.addEventListener('change', onChange);

    if (options.enableSaveButton) {
        options.element.querySelector('.btnSave').classList.remove('hide');
    }

    // LumaFin: not part of the Android app's home settings, so keep it hidden
    // even on the TV layout.
    options.element.querySelector('.selectTVHomeScreenContainer').classList.add('hide');

    self.loadData(options.autoFocus);
}

class HomeScreenSettings {
    constructor(options) {
        this.options = options;
        embed(options, this);
    }

    loadData(autoFocus) {
        const self = this;
        const context = self.options.element;

        loading.show();

        const userId = self.options.userId;
        const apiClient = ServerConnections.getApiClient(self.options.serverId);
        const userSettings = self.options.userSettings;

        apiClient.getUser(userId).then(user => {
            userSettings.setUserInfo(userId, apiClient).then(() => {
                self.dataLoaded = true;

                loadForm(context, user, userSettings, apiClient);

                if (autoFocus) {
                    focusManager.autoFocus(context);
                }
            });
        });
    }

    submit() {
        onSubmit.call(this);
    }

    destroy() {
        this.options = null;
    }
}

export default HomeScreenSettings;
