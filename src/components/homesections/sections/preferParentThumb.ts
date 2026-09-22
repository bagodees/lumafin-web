import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models/base-item-dto';

// LumaFin: cardbuilder/utils/url.ts checks an episode's OWN Thumb image tag
// before it ever looks at inheritThumb/SeriesThumbImageTag, so passing
// inheritThumb: true only affects items that don't already have their own
// Thumb - most episodes do (an auto-generated keyframe), and it's usually a
// much tighter crop than the series' art, making cards look badly zoomed.
// LumaFin-AndroidTV's "prefer parent thumb" option instead skips the
// episode's own image entirely in favor of the series/season one. This
// clears the episode-level tags so cardBuilder's fallback chain does the same.
export function preferParentThumb(items: BaseItemDto[]): BaseItemDto[] {
    return items.map(item => {
        if (item.Type !== 'Episode') return item;
        if (!item.SeriesThumbImageTag && !item.ParentThumbItemId && !item.ParentBackdropImageTags?.length) return item;
        if (!item.ImageTags?.Thumb) return item;

        const { Thumb: _thumb, ...restImageTags } = item.ImageTags;
        return { ...item, ImageTags: restImageTags };
    });
}
