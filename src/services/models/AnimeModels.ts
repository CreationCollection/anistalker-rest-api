export interface IAnimePage {
    hasNextPage(): boolean;
    next(): Promise<Anime[]>;
    get(index: number): Anime;
    getAll(): readonly Anime[];
    size(): number;
    onStateChange(listener: (state: AnimePageState, value1: number, value2: number) => void): void;
}

export enum AnimePageState {
    LOADING,
    ADDED
}

// -----------------------------
//  Anime Properties
// ------------------------------

export class Anime {
    constructor(
        public id: AnimeId = new AnimeId(),
        public title: AnimeTitle = new AnimeTitle(),
        public type: AnimeType = AnimeType.ALL,
        public image: string = "",
        public episodes: AnimeEpisode = new AnimeEpisode(),
        public isAdult: boolean = false,
        public duration: number = 0
    ) { }
}

export class AnimeSpotlight {
    constructor(
        public id: number = 0,
        public title: AnimeTitle = new AnimeTitle(),
        public image: string = "",
        public episodes: AnimeEpisode = new AnimeEpisode(),
        public type: AnimeType = AnimeType.ALL,
        public rank: number = 0,
        public duration: number = 0,
        public description: string | null = null
    ) { }
}

export class AnimeFull {
    constructor(
        public id: AnimeId = new AnimeId(),
        public title: AnimeTitle = new AnimeTitle(),
        public type: AnimeType = AnimeType.ALL,
        public start: AnimeDate = new AnimeDate(),
        public end: AnimeDate = new AnimeDate(),
        public season: AnimeSeason = AnimeSeason.ALL,
        public status: AnimeStatus = AnimeStatus.ALL,
        public coverImage: string = "",
        public images: string[] = [],
        public description: string = "",
        public otherNames: string[] = [],
        public episodes: AnimeEpisode = new AnimeEpisode(),
        public relations: AnimeRelations[] = [],
        public score: number | null = null,
        public isAdult: boolean = false,
        public duration: number = 0,
        public genres: string[] = []
    ) { }
}

export class AnimeDate {
    constructor(public date: number = 0, public month: number = 0, public year: number = 0) { }
}

export class AnimeId {
    constructor(public aniId: number = 0, public malId: number = 0, public zoroId: number = 0) { }
}

export class AnimeTitle {
    constructor(public english: string | null = null, public userPreferred: string | null = null) { }
}

export class AnimeEpisode {
    constructor(public total: number = 0, public sub: number = 0, public dub: number = 0) { }
}

export class AnimeEpisodeDetail {
    constructor(
        public id: number = 0,
        public episode: number = 0,
        public title: string | null = null,
        public isFiller: boolean = false,
        public url: string | null = null
    ) { }
}

export class AnimeRelations {
    constructor(public zoroId: number = 0, public image: string | null = null, public title: string | null = null) { }
}

export class AnimeServer {
    constructor(public server: ZoroServers | null = null, public serverId: number = 0) { }
}

export class AnimeEpisodeServers {
    constructor(public sub: AnimeServer[] = [], public dub: AnimeServer[] = []) { }
}

export class AnimeSubtitle {
    constructor(public lang: string | null = null, public url: string | null = null) { }
}

export class ZoroStreamData {
    constructor(
        public videoUrl: string | null = null,
        public introStart: number | null = null,
        public introEnd: number | null = null,
        public outroStart: number | null = null,
        public outroEnd: number | null = null,
        public subtitles: AnimeSubtitle[] | null = null
    ) { }
}

export enum ZoroServers {
    VIDSTREAMING = "vidstreaming",
    VIDCLOUD = "vidcloud",
    MEGACLOUD = "megacloud",
    // STREAMSB = "streamsb",
    // STREAMTAPE = "streamtape"
}

export enum AnimeCategory {
    TOP_AIRING = "top-airing",
    MOST_POPULAR = "most-popular",
    MOST_FAVORITE = "most-favorite",
    COMPLETED = "completed",
    RECENTLY_UPDATED = "recently-updated",
}

export enum AnimeType {
    ALL = "ALL",
    TV = "TV",
    MOVIE = "MOVIE",
    OVA = "OVA",
    ONA = "ONA",
    SPECIAL = "SPECIAL",
    MUSIC = "MUSIC",
}

export enum AnimeStatus {
    ALL = "ALL",
    FINISHED = "Finished Airing",
    AIRING = "Currently Airing",
    NOT_YET_RELEASED = "Not Yet Aired",
}

export enum AnimeSeason {
    ALL = "ALL",
    SPRING = "spring",
    SUMMER = "summer",
    FALL = "fall",
    WINTER = "winter",
}

export enum AnimeVoiceTrack {
    SUB = "sub",
    DUB = "dub",
    BOTH = "subdub",
    ALL = "all",
}

export enum AnimeSort {
    DEFAULT = "default",
    RECENTLY_ADDED = "recently_added",
    RECENTLY_UPDATED = "recently_updated",
    SCORE = "score",
    NAME = "name_az",
    RELEASED_DATE = "release_date",
    MOST_WATCHED = "most_watched",
}

export enum AnimeScore {
    ALL = "all",
    APPEALING = "appealing",
    HORRIBLE = "horrible",
    VERY_BAD = "very_bad",
    BAD = "bad",
    AVERAGE = "average",
    FINE = "fine",
    GOOD = "good",
    VERY_GOOD = "very_good",
    GREAT = "great",
    MASTERPIECE = "masterpiece",
}
