import axios, { AxiosResponse } from "axios";
import { AnimeEpisode, AnimeEpisodeDetail, AnimeEpisodeServers, AnimeServer, ZoroServers, ZoroStreamData } from "../../../models/AnimeModels.js";
import { RapidCloud } from "./RapidCloud.js"
import { load } from "cheerio";
import { formatVideo } from "../../../../aniutils/M3U8Util.js";


export class ZoroStream {
    static async getEpisodes(id: number): Promise<AnimeEpisodeDetail[]> {
        let episodes: AnimeEpisodeDetail[] = []
        try {
            let result: AxiosResponse | null = null
            try {
                result = await axios.get(`https://aniwatch.to/ajax/v2/episode/list/${id}`, {
                    headers: {
                        "Requested-With": "XMLHttpRequest",
                        "Referer": `https://aniwatch.to/watch/anime-${id}`
                    },
                    responseType: "json"
                })
            }
            catch (err: any) {

            }

            if (!result) return episodes

            let total = result.data.totalItems
            let $ = load(result.data.html)

            $('.detail-infor-content > div > a').each((_, item) => {
                let info = new AnimeEpisodeDetail()
                episodes.push(info)

                info.id = parseInt($(item).attr('data-id') || '0')
                info.episode = parseInt($(item).attr('data-number') || '0')
                info.url = $(item).attr('href')
                info.isFiller = $(item).attr('class')?.includes('ssl-item-filler') || false
                info.title = $(item).children().eq(1).children().text()
            })
        }
        catch (err) {
            throw err
        }

        return episodes
    }

    static async getServersForEpisode(id: number): Promise<AnimeEpisodeServers> {
        let result: AxiosResponse | null = null
        try {
            result = await axios.get(`https://aniwatch.to/ajax/v2/episode/servers?episodeId=${id}`, {
                responseType: 'json'
            })
        }
        catch (err: any) {
        }

        let sublist: AnimeServer[] = []
        let dublist: AnimeServer[] = []
        let servers = new AnimeEpisodeServers(sublist, dublist)

        if (!result || !result.data.html) return servers

        let $ = load(result.data.html)
        $('.server-item').each((_, item) => {
            let type =
                Object.entries(ZoroServers).find(([_, val]) => val.toLowerCase() == $(item).text().trim().toLowerCase())?.[1]
            if (type) {
                let server = new AnimeServer(type, parseInt($(item).attr('data-id') || '0'))
                if ($(item).attr('data-type') == 'sub')
                    sublist.push(server)
                else if ($(item).attr('data-type') == 'dub')
                    dublist.push(server)
            }
        })

        return servers
    }

    static async getServerUrl(serverId: number): Promise<string> {
        let result: AxiosResponse | null = null
        try {
            result = await axios.get(`https://aniwatch.to/ajax/v2/episode/sources?id=${serverId}`, {
                responseType: 'json'
            })
        }
        catch (err: any) {
        }
        return result?.data.link
    }

    static getVideoData = async (serverid: number, seperateFiles: boolean = false): Promise<ZoroStreamData> => {
        let data: ZoroStreamData = new ZoroStreamData()
        try {
            throw new Error()
            data = await RapidCloud.extract(await this.getServerUrl(serverid), seperateFiles)
        }
        catch (err: any) {
            const result = await axios.get('https://api.consumet.org/anime/gogoanime/watch/kagejitsu-second-episode-6')
            const master = result.data.sources[result.data.sources.length - 1].url
            data = new ZoroStreamData(await formatVideo(master, seperateFiles))
        }
        return data
    }
}