import { Api } from '@jellyfin/sdk';
import { ImageType } from '@jellyfin/sdk/lib/generated-client/models/image-type';
import { getImageApi } from '@jellyfin/sdk/lib/utils/api/image-api';

import { ItemDto } from 'types/base/models/item-dto';
import { CardOptions } from 'types/cardOptions';

import layoutManager from 'components/layoutManager';

import { getDesiredAspect } from './builder';
import { CardShape } from './shape';

// LumaFin: the Tizen webview's HTTP cache appears to key on URL path only,
// not the full query string - image requests we made early in development
// (when width/height math was still broken) kept getting served back for
// every later request to the same item/tag, no matter what size or quality
// we actually asked for this run (confirmed: fetching the exact URL the app
// requested, fresh, outside the webview, returned the correct full image
// every time - only the webview's own rendering showed the stale cropped
// one). A value that's stable for one app session but changes across
// launches busts any such stale entry without preventing reuse within a
// single session.
const tvCacheBustValue = layoutManager.tv ? String(Date.now()) : undefined;

interface CardImageUrlParams {
    api?: Api;
    item: ItemDto;
    options: CardOptions;
    shape?: CardShape;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function getCardImageUrl({
    api,
    item,
    options,
    shape
}: CardImageUrlParams) {
    item = item.ProgramInfo || item;

    const width = options.width;
    let height: number | undefined;
    const primaryImageAspectRatio = item.PrimaryImageAspectRatio;
    let forceName = false;
    let imgUrl: string | undefined;
    let imgTag = null;
    let coverImage = false;
    const uiAspect = getDesiredAspect(shape);
    let imgType: ImageType | undefined;
    let itemId = null;

    const skipEpisodeParentPoster = item.Type === 'Episode' && uiAspect != null && uiAspect > 1;

    /* eslint-disable sonarjs/no-duplicated-branches */
    if (options.preferThumb && item.ImageTags?.Thumb) {
        imgType = ImageType.Thumb;
        imgTag = item.ImageTags.Thumb;
    } else if ((options.preferBanner || shape === CardShape.Banner) && item.ImageTags?.Banner) {
        imgType = ImageType.Banner;
        imgTag = item.ImageTags.Banner;
    } else if (options.preferDisc && item.ImageTags?.Disc) {
        imgType = ImageType.Disc;
        imgTag = item.ImageTags.Disc;
    } else if (options.preferLogo && item.ImageTags?.Logo) {
        imgType = ImageType.Logo;
        imgTag = item.ImageTags.Logo;
    } else if (options.preferLogo && item.ParentLogoImageTag && item.ParentLogoItemId) {
        imgType = ImageType.Logo;
        imgTag = item.ParentLogoImageTag;
        itemId = item.ParentLogoItemId;
    } else if (options.preferThumb && item.SeriesThumbImageTag && options.inheritThumb !== false) {
        imgType = ImageType.Thumb;
        imgTag = item.SeriesThumbImageTag;
        itemId = item.SeriesId;
    } else if (options.preferThumb && item.ParentThumbItemId && options.inheritThumb !== false && item.MediaType !== 'Photo') {
        imgType = ImageType.Thumb;
        imgTag = item.ParentThumbImageTag;
        itemId = item.ParentThumbItemId;
    } else if (options.preferThumb && item.BackdropImageTags?.length) {
        imgType = ImageType.Backdrop;
        imgTag = item.BackdropImageTags[0];
        forceName = true;
    } else if (options.preferThumb && item.ParentBackdropImageTags?.length && options.inheritThumb !== false && item.Type === 'Episode') {
        imgType = ImageType.Backdrop;
        imgTag = item.ParentBackdropImageTags[0];
        itemId = item.ParentBackdropItemId;
    } else if (options.preferParentPoster && !options.preferThumb && item.Type === 'Episode'
        && ((item.ParentPrimaryImageTag && item.ParentPrimaryImageItemId) || (item.SeriesPrimaryImageTag && item.SeriesId))) {
        imgType = ImageType.Primary;
        if (item.ParentPrimaryImageTag && item.ParentPrimaryImageItemId) {
            imgTag = item.ParentPrimaryImageTag;
            itemId = item.ParentPrimaryImageItemId;
        } else {
            imgTag = item.SeriesPrimaryImageTag;
            itemId = item.SeriesId;
        }
    } else if (item.ImageTags?.Primary && (item.Type !== 'Episode' || item.ChildCount !== 0)) {
        imgType = ImageType.Primary;
        imgTag = item.ImageTags.Primary;
        height = width && primaryImageAspectRatio ? (width / primaryImageAspectRatio) : undefined;

        if (options.preferThumb && options.showTitle !== false) {
            forceName = true;
        }

        if (primaryImageAspectRatio && uiAspect) {
            coverImage = (Math.abs(primaryImageAspectRatio - uiAspect) / uiAspect) <= 0.2;
        }
    } else if (item.SeriesPrimaryImageTag && !skipEpisodeParentPoster) {
        imgType = ImageType.Primary;
        imgTag = item.SeriesPrimaryImageTag;
        itemId = item.SeriesId;
    } else if (item.PrimaryImageTag) {
        imgType = ImageType.Primary;
        imgTag = item.PrimaryImageTag;
        itemId = item.PrimaryImageItemId;
        height = width && primaryImageAspectRatio ? (width / primaryImageAspectRatio) : undefined;

        if (options.preferThumb && options.showTitle !== false) {
            forceName = true;
        }

        if (primaryImageAspectRatio && uiAspect) {
            coverImage = (Math.abs(primaryImageAspectRatio - uiAspect) / uiAspect) <= 0.2;
        }
    } else if (item.ParentPrimaryImageTag && !skipEpisodeParentPoster) {
        imgType = ImageType.Primary;
        imgTag = item.ParentPrimaryImageTag;
        itemId = item.ParentPrimaryImageItemId;
    } else if (item.AlbumId && item.AlbumPrimaryImageTag) {
        imgType = ImageType.Primary;
        imgTag = item.AlbumPrimaryImageTag;
        itemId = item.AlbumId;
        height = width && primaryImageAspectRatio ? (width / primaryImageAspectRatio) : undefined;

        if (primaryImageAspectRatio && uiAspect) {
            coverImage = (Math.abs(primaryImageAspectRatio - uiAspect) / uiAspect) <= 0.2;
        }
    } else if (item.Type === 'Season' && item.ImageTags?.Thumb) {
        imgType = ImageType.Thumb;
        imgTag = item.ImageTags.Thumb;
    } else if (item.BackdropImageTags?.length) {
        imgType = ImageType.Backdrop;
        imgTag = item.BackdropImageTags[0];
    } else if (item.ImageTags?.Thumb) {
        imgType = ImageType.Thumb;
        imgTag = item.ImageTags.Thumb;
    } else if (item.SeriesThumbImageTag && options.inheritThumb !== false) {
        imgType = ImageType.Thumb;
        imgTag = item.SeriesThumbImageTag;
        itemId = item.SeriesId;
    } else if (item.ParentThumbItemId && options.inheritThumb !== false) {
        imgType = ImageType.Thumb;
        imgTag = item.ParentThumbImageTag;
        itemId = item.ParentThumbItemId;
    } else if (item.ParentBackdropImageTags?.length && options.inheritThumb !== false) {
        imgType = ImageType.Backdrop;
        imgTag = item.ParentBackdropImageTags[0];
        itemId = item.ParentBackdropItemId;
    }
    /* eslint-enable sonarjs/no-duplicated-branches */

    if (!itemId) {
        itemId = item.Id;
    }

    if (api && itemId && imgTag && imgType) {
        if (!height && width && uiAspect) {
            height = width / uiAspect;
        }

        // LumaFin: window.devicePixelRatio has also been unreliable on the
        // Tizen webview (like window.innerWidth - see setCardData in
        // cardBuilder.js). 1.2 on TV lands close to the ~533px width
        // LumaFin-AndroidTV actually requests for the same card, rather than
        // an arbitrary larger size.
        const dpr = layoutManager.tv ? 1.2 : (window?.devicePixelRatio || 1);

        // LumaFin: fillWidth/fillHeight crop server-side to whatever box size
        // we computed, which only matches the actual rendered card if that
        // computation (getImageWidth's posters-per-row estimate) is in sync
        // with the CSS - easy to drift, and a mismatch double-crops the image
        // (server crop, then CSS cover crops again). LumaFin-AndroidTV instead
        // requests maxWidth/maxHeight (scale down, no crop) and lets
        // CENTER_CROP - background-size: cover here - do the cropping once,
        // against the real box. Match that on TV, where cards are already a
        // fixed 16:9 shape so there's no benefit to server-side cropping.
        const noServerCrop = layoutManager.tv;

        imgUrl = getImageApi(api).getItemImageUrlById(
            itemId,
            imgType,
            {
                // Dimensions must be rounded or the API will reject the request
                fillHeight: !noServerCrop && height ? Math.ceil(height * dpr) : undefined,
                fillWidth: !noServerCrop && width ? Math.ceil(width * dpr) : undefined,
                maxHeight: noServerCrop && height ? Math.ceil(height * dpr) : undefined,
                maxWidth: noServerCrop && width ? Math.ceil(width * dpr) : undefined,
                quality: 96,
                tag: imgTag
            }
        );

        if (tvCacheBustValue) {
            imgUrl += (imgUrl.includes('?') ? '&' : '?') + '_lb=' + tvCacheBustValue;
        }
    }

    const blurHashes = options.imageBlurhashes || item.ImageBlurHashes || {};

    return {
        imgUrl,
        blurhash: (imgType && imgTag) ? blurHashes[imgType]?.[imgTag] : undefined,
        forceName,
        coverImage
    };
}
