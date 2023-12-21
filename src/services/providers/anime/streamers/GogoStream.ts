import axios from "axios";
import { load } from "cheerio";
import { ZoroMapper } from '../informers/ZoroMapper.js'
import { GogoCdn } from "./GogoCdn.js";
import { Video } from "../../../models/VideoModels.js";

export class GogoStream {
    static readonly baseUrl = 'https://gogoanime3.net'

    static async getVideoData(
        zoroId: number, 
        episode: number, 
        lang: 'sub' | 'dub', 
        seperateFiles: boolean
    ): Promise<Video> {
        const map = await ZoroMapper.mapZoro(zoroId)
        const animeId = lang == 'sub' ? map.gogoSub : map.gogoDub

        if (animeId == null) throw new Error("No Anime Found for ID: " + zoroId)

        const episodeId = `${animeId}-episode-${episode}`
        const videoUrl = await this.getStreamUrl(episodeId)

        if (videoUrl == null) throw new Error('No Source found for episode ' + episode)

        return GogoCdn.extract(videoUrl, seperateFiles)
    }

    static async getStreamUrl(id: string): Promise<string | null> {
        const res = await axios.get(`${this.baseUrl}/${id}`)
        const $ = load(res.data)
        const url = $('#load_anime > div > div > iframe').attr('src')
        return url ?? null
    }
}