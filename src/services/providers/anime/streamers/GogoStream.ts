import axios from "axios";
import { load } from "cheerio";
import { ZoroMapper } from '../informers/ZoroMapper.js'
import { GogoCdn } from "./GogoCdn.js";
import { Video } from "../../../models/VideoModels.js";

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

        if (animeId.media == null) throw new Error("No Anime Found for ID: " + zoroId)
        const videoUrl = await this.getStreamUrl(animeId.media, episode)

        if (videoUrl == null) throw new Error('No Source found for episode ' + episode)

        return GogoCdn.extract(videoUrl, seperateFiles)
    }

    static async getStreamUrl(mediaId: number, episode: number): Promise<string | null> {
        const episodeId = (await axios.get(`${this.episodeAjax}?ep_start=${episode}&ep_end=${episode}&id=${mediaId}`)).data.match(/\/(.*?)(?=")/)[0]
        console.log(this.baseUrl + episodeId)
        
        const res = await axios.get(this.baseUrl + episodeId)
        const $ = load(res.data)
        const url = $('#load_anime > div > div > iframe').attr('src')
        return url ?? null
    }
}