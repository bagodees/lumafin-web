import { HomeSectionType } from './homeSectionType';

// LumaFin: display name and full catalog order for the single reorderable/
// toggleable home section list (mirrors LumaFin-AndroidTV's SettingsHomeScreen).
// Order here is what the "hidden sections" group is sorted by.
export const HOME_SECTION_TITLE_KEYS: Record<HomeSectionType, string> = {
    [HomeSectionType.None]: 'None',
    [HomeSectionType.SmallLibraryTiles]: 'HeaderMyMedia',
    [HomeSectionType.LibraryButtons]: 'HeaderMyMediaSmall',
    [HomeSectionType.ActiveRecordings]: 'HeaderActiveRecordings',
    [HomeSectionType.Resume]: 'HeaderContinueWatching',
    [HomeSectionType.ResumeAudio]: 'HeaderContinueListening',
    [HomeSectionType.ResumeBook]: 'HeaderContinueReading',
    [HomeSectionType.LatestMedia]: 'HeaderLatestMedia',
    [HomeSectionType.NextUp]: 'NextUp',
    [HomeSectionType.LiveTv]: 'LiveTV',
    [HomeSectionType.LatestMovies]: 'HeaderLatestMoviesByRelease',
    [HomeSectionType.LatestShows]: 'HeaderLatestShowsByRelease',
    [HomeSectionType.BecauseYouWatched]: 'BecauseYouWatched',
    [HomeSectionType.WatchAgain]: 'HeaderWatchAgain',
    [HomeSectionType.Collections]: 'Collections',
    [HomeSectionType.Genres]: 'Genres',
    [HomeSectionType.ContinueWatchingNextUp]: 'HomeSectionContinueWatchingNextUp',
    [HomeSectionType.Favorites]: 'HomeSectionFavorites',
    [HomeSectionType.RecentlyAddedMovies]: 'HomeSectionRecentlyAddedMovies',
    [HomeSectionType.RecentlyAddedShows]: 'HomeSectionRecentlyAddedShows',
    [HomeSectionType.RecentlyAddedAlbums]: 'HomeSectionRecentlyAddedAlbums',
    [HomeSectionType.RecentlyAddedArtists]: 'HomeSectionRecentlyAddedArtists',
    [HomeSectionType.RecentlyAddedMusicVideos]: 'HomeSectionRecentlyAddedMusicVideos',
    [HomeSectionType.RecentlyAddedBooks]: 'HomeSectionRecentlyAddedBooks',
    [HomeSectionType.RecentlyAddedAudiobooks]: 'HomeSectionRecentlyAddedAudiobooks',
    [HomeSectionType.LatestAlbums]: 'HomeSectionLatestAlbums',
    [HomeSectionType.LatestMusicVideos]: 'HomeSectionLatestMusicVideos',
    [HomeSectionType.LatestBooks]: 'HomeSectionLatestBooks',
    [HomeSectionType.LatestAudiobooks]: 'HomeSectionLatestAudiobooks'
};

// Every section type that can appear in the picker, in catalog order
// (excludes None, which just means "nothing in this slot" in the old scheme).
export const ALL_HOME_SECTION_TYPES: HomeSectionType[] = Object.values(HomeSectionType)
    .filter((type) => type !== HomeSectionType.None);
