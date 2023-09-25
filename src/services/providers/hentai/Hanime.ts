import axios from "axios";
import crypto from 'crypto'
import { Parser } from "m3u8-parser";

import { Hentai, HentaiDate, HentaiStream, HentaiTag, HentaiVideo } from "../../models/HentaiModels.js"
import { VideoSegment } from "../../models/VideoModels.js";

const fetch = async (url: string): Promise<any> => {
    try {
        const headers = {
            'X-Signature-Version': 'web2',
            'X-Signature': crypto.randomBytes(32).toString('hex'),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        };
        const res = await axios.get(url, { headers });
        return res.data;
    } catch (error: any) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
};

const post = async (url: string, body: any): Promise<any> => {
    try {
        const headers = {
            'X-Signature-Version': 'web2',
            'X-Signature': crypto.randomBytes(32).toString('hex'),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        };
        const res = await axios.post(url, body, { headers });
        return res.data;
    } catch (error: any) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
}

const extractHentai = (item: any): Hentai => {
    let hentai = new Hentai()

    hentai.name = item.name;
    hentai.slug = item.slug;
    hentai.releaseAt = HentaiDate.toDate(item.released_at)
    hentai.views = item.views;
    hentai.images = {
        poster: item.poster_url,
        cover: item.cover_url,
    }
    hentai.brand = item.brand;
    hentai.censored = item.is_censored
    hentai.likes = item.likes
    hentai.rank = item.monthly_rank
    hentai.rating = item.rating

    return hentai
}

const extractHentaiVideos = (data: any): Hentai[] => {
    let list: Hentai[] = []
    for (let item of data) {
        let hentai = extractHentai(item)
        list.push(hentai)
    }
    return list
}

const extractTags = (items: any): HentaiTag[] => {
    let list: HentaiTag[] = []

    for (let item of items) {
        let hentai = new HentaiTag()
        hentai.name = item.text
        hentai.desc = item.description
        hentai.images = {
            short: item.wide_image_url,
            tall: item.tall_image_url,
        }
        list.push(hentai)
    }

    return list
}

const extractStreams = async (items: any, s: boolean = false)
        : Promise<{ hd: HentaiStream | string, uhd: HentaiStream | string }> => {
    let hd: HentaiStream | string = new HentaiStream()
    let uhd: HentaiStream | string = new HentaiStream()

    for (let item of items) {
        if (item.is_guest_allowed) {
            let file: HentaiStream

            if (parseInt(item.height) > 700) {
                if (!s) {
                    uhd = item.url
                    continue
                }
                file = uhd as HentaiStream
            }
            else if (parseInt(item.height) > 400) {
                if (!s) {
                    hd = item.url
                    continue
                }
                file = hd as HentaiStream
            }
            else continue

            let { data } = await axios.get(item.url)
            let parser = new Parser()
            parser.push(data)
            parser.end()

            let key = parser.manifest.segments[0].key
            file.key = await (await axios.get(key.uri)).data
            file.method = key.method

            let start = 0
            parser.manifest.segments.forEach(seg => {
                file.files.push(new VideoSegment(seg.duration, start, seg.uri))
                start += seg.duration
            });
            file.duration = start
        }
    }

    return { hd, uhd }
}

// const formatVideo = async (master: string): Promise<VideoFile> => {

    
// }

const search = async (keyword: string, page: number = 1)
    : Promise<{ videos: Hentai[], lastPage: number, total: number}> => {
    let url = `https://search.htv-services.com`
    let params = {
        "search_text": keyword,
        "tags": [],
        "tags_mode": "AND",
        "brands": [],
        "blacklist": [],
        "order_by": "created_at_unix",
        "ordering": "desc",
        "page": page - 1
    }
    let data = await post(url, params)
    return { videos: extractHentaiVideos(JSON.parse(data.hits)), lastPage: data.nbPages, total: data.nbHits }
}

const getTrending = async (time: 'day' | 'week' | 'month' = 'day', page: number = 1)
    : Promise<{ videos: Hentai[], lastPage: number }> => {
    let url = `https://hanime.tv/api/v8/browse-trending?time=${time}&page=${page}&order_by=views&ordering=desc`;
    const data = await fetch(url);
    return { videos: extractHentaiVideos(data.hentai_videos), lastPage: data.number_of_pages }
}

const getRandom = async (): Promise<Hentai[]> => {
    let curTime = Date.now()
    let url = `https://hanime.tv/rapi/v7/hentai_videos?source=randomize&r=${curTime}`
    const data = await fetch(url)
    return extractHentaiVideos(data.hentai_videos)
}

const getTags = async (): Promise<HentaiTag[]> => {
    let data = await fetch('https://hanime.tv/api/v8/browse');
    return extractTags(data.hentai_tags)
}

const getVideoByCategory = async (category: string, page: number = 1)
    : Promise<{ videos: Hentai[], lastPage: number }> => {
    let url = `https://hanime.tv/api/v8/browse/hentai-tags/${category}?page=${page}&order_by=views&ordering=desc`
    let data = await fetch(url);
    return { videos: extractHentaiVideos(data.hentai_videos), lastPage: data.number_of_pages }
}

const getVideo = async (slug: string, seperateFiles: boolean = false): Promise<HentaiVideo> => {
    let url = `https://hanime.tv/api/v8/video?id=${slug}`
    let data = await fetch(url);

    let video = new HentaiVideo()

    video.details = extractHentai(data.hentai_video)
    video.next_video = extractHentai(data.next_hentai_video)
    video.random_video = extractHentai(data.next_random_hentai_video)
    video.tags = extractTags(data.hentai_tags)
    video.related = extractHentaiVideos(data.hentai_franchise_hentai_videos)
    video.video_streams = await extractStreams(data.videos_manifest.servers[0].streams, seperateFiles)

    return video
}

export default { getTags, getTrending, getVideoByCategory, getVideo, getRandom, search };