// NOTE: This should be included in the OpenAPI spec ideally
// https://github.com/jellyfin/jellyfin/blob/1b4394199a2f9883cd601bdb8c9d66015397aa52/Jellyfin.Data/Enums/HomeSectionType.cs
// LumaFin: LatestMovies/LatestShows/BecauseYouWatched/WatchAgain/Collections/Genres
// are client-only section types (stored as free-form CustomPrefs strings, not
// part of the server's HomeSectionType enum) matching the feature set of
// https://github.com/IAmParadox27/jellyfin-plugin-home-sections
export enum HomeSectionType {
    None = 'none',
    SmallLibraryTiles = 'smalllibrarytiles',
    LibraryButtons = 'librarybuttons',
    ActiveRecordings = 'activerecordings',
    Resume = 'resume',
    ResumeAudio = 'resumeaudio',
    LatestMedia = 'latestmedia',
    NextUp = 'nextup',
    LiveTv = 'livetv',
    ResumeBook = 'resumebook',
    LatestMovies = 'latestmovies',
    LatestShows = 'latestshows',
    BecauseYouWatched = 'becauseyouwatched',
    WatchAgain = 'watchagain',
    Collections = 'collections',
    Genres = 'genres'
}

// LumaFin: default section layout matching the LumaFin-AndroidTV fork:
// Continue Watching, Next Up, Latest Movies, Latest Shows, Because You
// Watched, My Media, Recently Added, Watch Again, Collections, Genres.
export const DEFAULT_SECTIONS: HomeSectionType[] = [
    HomeSectionType.Resume,
    HomeSectionType.NextUp,
    HomeSectionType.LatestMovies,
    HomeSectionType.LatestShows,
    HomeSectionType.BecauseYouWatched,
    HomeSectionType.SmallLibraryTiles,
    HomeSectionType.LatestMedia,
    HomeSectionType.WatchAgain,
    HomeSectionType.Collections,
    HomeSectionType.Genres
];
