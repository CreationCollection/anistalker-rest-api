import axios, { AxiosError, AxiosResponse } from "axios";
import { AnimeEpisode, AnimeEpisodeDetail, AnimeEpisodeServers, AnimeServer, ZoroServers, ZoroStreamData } from "../../../models/AnimeModels.js";
import { RapidCloud } from "./RapidCloud.js"
import { load } from "cheerio";
import { ZoroMapper } from "../informers/ZoroMapper.js";
import { GogoStream } from "./GogoStream.js";


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

            try {
                const mapping = await ZoroMapper.mapZoro(id)
                if (mapping.gogoDub.media != null) {
                    const dubEpisodes = await GogoStream.getEpisodeList(
                        mapping.gogoDub.media,
                        1, 9999
                    )

                    episodes.forEach((val: AnimeEpisodeDetail) => {
                        val.hasDub = dubEpisodes.includes(val.episode)
                    })
                }
            }
            catch (err: any) {
                if (err instanceof AxiosError) console.log(err.message)
                else console.log(err)
            }
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
        return RapidCloud.extract(await this.getServerUrl(serverid), seperateFiles)
    }
}