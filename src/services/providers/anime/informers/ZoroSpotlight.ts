import { AnimeSpotlight, AnimeTrending, AnimeType, parseDuration } from "../../../models/AnimeModels.js"
import { AniError, AniErrorCode } from "../../../../aniutils/AniError.js"
import axios, { AxiosError, AxiosResponse } from "axios"
import { load } from "cheerio"


export class ZoroSpotlight {
    static async getSpotlightAnime(): Promise<AnimeSpotlight[]> {
        let animelist: AnimeSpotlight[] = []
        try {
            let result: AxiosResponse | null = null
            try {
                result = await axios.get("https://aniwatch.to/home", { responseType: "text" })
            }
            catch (err) {
                if (err instanceof AxiosError) {
                    if (err.response?.status == 404) {
                        throw AniError.buildWithMessage(AniErrorCode.NOT_FOUND, "Page not found")
                    } else if (Math.floor(err.response?.status ? err.response.status : 1 / 100) !== 2) {
                        throw AniError.build(AniErrorCode.UNKNOWN)
                    }
                }
            }

            if (!result) return animelist

            let $ = load(result.data)
            $("#slider .swiper-wrapper .swiper-slide .deslide-item").each((_, item) => {
                let anime = new AnimeSpotlight()

                anime.image = $(item).find('.deslide-cover img').attr('data-src') || ''
                let content = $(item).find('.deslide-item-content')

                anime.id = parseInt(
                    $(content.find('.desi-buttons > a').get(0)).attr('href')?.split('-')?.pop() 
                    || '0')

                anime.rank = parseInt(content.find('.desi-sub-text').text()
                    .split(' ')[0].replace('#', ''))

                let head = content.find('.desi-head-title')
                anime.title.english = head.text()
                anime.title.userPreferred = head.attr('data-jname')

                let type = content.find('.sc-detail .scd-item:nth-child(0)').text()
                anime.type =
                    Object.entries(AnimeType)
                        .find(([_, val]) => val.toLowerCase() == type.toLowerCase())?.[1]
                    || AnimeType.TV

                let items = content.find('.sc-detail .scd-item')
                anime.duration = parseDuration($(items.get(1)).text())

                $(items.get(4)).find('.tick > .tick-item')
                    .each((_, val) => {
                        if ($(val).attr('class')?.includes('tick-sub')) {
                            anime.episodes.sub = parseInt($(val).text())
                        }
                        else if ($(val).attr('class')?.includes('tick-dub')) {
                            anime.episodes.dub = parseInt($(val).text())
                        }
                        else if ($(val).attr('class')?.includes('tick-eps')) {
                            anime.episodes.total = parseInt($(val).text())
                        }
                    })

                anime.description = content.find('.desi-description').text().trim()

                animelist.push(anime)
            })
        }
        catch (error) {
            if (error instanceof Error) {
                throw new AniError(AniErrorCode.UNKNOWN, error.message ?? "Unknown Error")
            }
            else {
                console.log(error)
            }
        }
        return animelist
    }

    static async getTrendingAnime(): Promise<AnimeTrending[]> {
        const list: AnimeTrending[] = []
        
        const res = await axios.get('https://aniwatch.to/home')
        const $ = load(res.data)

        $('#trending-home .item').each((_, item) => {
            const anime = new AnimeTrending()
            
            anime.id = parseInt($(item).find('.film-poster').attr('href')?.split('-')?.pop() || '0')
            anime.rank = parseInt($(item).find('.number > span').text())
            anime.title = {
                english: $(item).find('.number > div').text(),
                userPreferred: $(item).find('.number > div').attr('data-jname')
            }
            anime.image = $(item).find('.film-poster > img').attr('data-src') || ''

            list.push(anime)
        })

        return list
    }
}