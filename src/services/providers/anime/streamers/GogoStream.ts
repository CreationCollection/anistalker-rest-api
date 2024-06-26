import axios from "axios";
import { load } from "cheerio";
import { ZoroMapper } from '../informers/ZoroMapper.js'
import { GogoCdn } from "./GogoCdn.js";
import { Video } from "../../../models/VideoModels.js";
import { AniError, AniErrorCode } from "../../../../aniutils/AniError.js";

export class GogoStream {
    static readonly baseUrl = 'https://gogoanime3.net'
    static readonly episodeAjax = 'https://ajax.gogo-load.com/ajax/load-list-episode'

    static async getVideoData(
        zoroId: number,
        episode: number,
        lang: 'sub' | 'dub',
        seperateFiles: boolean
    ): Promise<Video> {
        const map = await ZoroMapper.mapZoro(zoroId)
        const animeId = lang == 'sub' ? map.gogoSub : map.gogoDub

        if (animeId.media == null) throw new AniError(AniErrorCode.NOT_FOUND, "Mapping Not Found!")
        const videoUrl = await this.getStreamUrl(animeId.media, episode)

        if (videoUrl == null) throw new Error('No Source found for episode ' + episode)

        return GogoCdn.extract(videoUrl, seperateFiles)
    }

    static async getStreamUrl(mediaId: number, episode: number, minEpisode: number | null = null): Promise<string | null> {
        const episodeId = (await axios.get(
            `${this.episodeAjax}?ep_start=${minEpisode ?? episode}&ep_end=${episode}&id=${mediaId}`
        )).data.match(/\/(.*?)(?=")/)[0]

        const res = await axios.get(this.baseUrl + episodeId)
        const $ = load(res.data)
        const url = $('#load_anime > div > div > iframe').attr('src')
        return url ?? null
    }

    static async getEpisodeList(mediaId: number, startEp: number, endEp: number): Promise<number[]> {
        const res = await axios.get(
            `${this.episodeAjax}?ep_start=${startEp}&ep_end=${endEp}&id=${mediaId}`
        )
        const $ = load(res.data)
        return $('ul#episode_related > li > a').map((_, item) => {
            return parseInt($(item).attr('href')?.split('-').pop() ?? '0')
        }).get().filter((v) => v > 0)
    }
}