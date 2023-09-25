import { VideoSegment } from "./VideoModels.js"


export class HentaiTag {
    constructor(
        public name: string = "",
        public desc: string = "",
        public images: { short: string, tall: string } = { short: '', tall: '' },
    ) { }
}

export class Hentai {
    constructor(
        public name: string = '',
        public slug: string = '',
        public releaseAt: HentaiDate = new HentaiDate(),
        public views: number = 0,
        public images: { poster: string, cover: string } = { poster: '', cover: '' },
        public brand: string = '',
        public censored: boolean = false,
        public likes: number = 0,
        public rank: number = 0,
        public rating: number = 0,
    ) { }
}

export class HentaiStream {
    constructor(
        public key: string = '',
        public method: string = 'AES-128',
        public duration: number = 0,
        public files: VideoSegment[] = []
    ) { }
}

export class HentaiVideo {
    constructor(
        public details: Hentai = new Hentai(),
        public altTitles: string[] = [],
        public related: Hentai[] = [],
        public tags: HentaiTag[] = [],
        public next_video: Hentai = new Hentai(),
        public random_video: Hentai = new Hentai(),
        public video_streams: { hd: HentaiStream | string, uhd: HentaiStream | string } = { hd: '', uhd: '' },
    ) { }
}

export class HentaiDate {
    constructor(public year: number = 0, public month: number = 0, public day: number = 0) { }

    static toDate(date: string): HentaiDate {
        let d = new HentaiDate()

        if (Number(date)) {
            let hd = new Date((new Date()).getTime() - parseInt(date))
            d.year = hd.getFullYear()
            d.month = hd.getMonth()
            d.day = hd.getDay()
        }
        else {
            let dates = date.split('T')[0].split('-')
            d.year = parseInt(dates[0])
            d.month = parseInt(dates[1])
            d.day = parseInt(dates[2])
        }
        return d
    }
}