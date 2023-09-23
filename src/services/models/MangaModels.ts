
export class Manga {
    constructor(
        public id: string | null = null,
        public title: MangaDetail | null = null,
        public altTitles: MangaDetail[] = [],
        public desc: MangaDetail | null = null,
        public mapping: MangaMapping | null = null,
        public lastVolume: number | null = null,
        public lastChapter: number | null = null,
        public type: string | null = null,
        public status: string | null = null,
        public year: number | null = null,
        public rating: string | null = null,
        public genres: string[] = [],
        public englishAvailable: boolean = false,
        public latestChapterId: string | null = null,
        public relation: MangaRelation[] = [],
        public coverId: string | null = null,
    ) { }
}

export class MangaChapter {
    constructor(
        public id: string | null = null,
        public volume: string | null = null,
        public chapter: string | null = null,
        public title: string = "",
        public pages: number = 0,
        public published: MangaDate | null = null,
        public updated: MangaDate | null = null
    ) { }
}

export interface IMangaPage {
    get(page: number): Promise<Manga[]>
    getLastPage(): number
}

export class MangaDetail {
    constructor(public lang: string = "", public title: string = "") { }
}

export class MangaRelation {
    constructor(public type: string = "", public id: string = "") { }
}

export class MangaMapping {
    constructor(public anilist: number, public malId: number) { }
}

export class MangaDate {
    constructor(
        public day: number = 0,
        public month: number = 0,
        public year: number = 0,
        public hour: number = 0,
        public minute: number = 0,
        public second: number = 0
    ) {}

    static extractDate(dateString: string): MangaDate {
        let date = new MangaDate()
        let vals = dateString.split('T')
        let dates = vals[0].split('-')
        let times = vals[1].split('+')[0].split(':')

        date.year = parseInt(dates[0])
        date.month = parseInt(dates[1])
        date.day = parseInt(dates[2])

        date.hour = parseInt(times[0])
        date.minute = parseInt(times[1])
        date.second = parseInt(times[2])

        return date
    }
}