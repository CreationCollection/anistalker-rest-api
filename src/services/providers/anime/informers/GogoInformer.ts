import axios, { AxiosError } from "axios";
import { load } from "cheerio";

export class GogoInformer {
    static async mapAnilistToGogo(
        data: any,
        narrowSearch: boolean = true,
    ): Promise<{ sub: string | null, dub: string | null } | null> {
        try {
            const result = {
                sub: null as null | string,
                dub: null as null | string
            }

            const relatedTitles: string[] = Object.values(data.relations)
                .flat()
                .filter(item => item) as string[]
            relatedTitles.push(data.title.native)
            if (!narrowSearch) relatedTitles.push(
                ...data.synonyms.filter((i: string) => /^[a-zA-Z\s]+$/.test(i))
            )

            console.log(relatedTitles)

            if (relatedTitles.length == 0) return null

            const searchName = findCommonName(relatedTitles)
            console.log(searchName)

            let item: any | null = null
            let hasNextPage = false
            let currentPage = 1

            const candies: any[] = []

            do {
                console.log("Page: " + (currentPage))
                const response = await axios.get(
                    `https://gogoanime3.net/search.html?keyword=${encodeURIComponent(searchName)}&page=${currentPage++}`
                )

                const $ = load(response.data)
                hasNextPage = $("div.anime_name.new_series > div > div > ul > li.selected").next().length > 0
                $("div.last_episodes > ul > li")
                    .each((_index: number, item: any) => {
                        const d = this.parseGogoSearchItem($(item))
                        if (d.year == data.year) candies.push(d)
                    }).get()
            } while (item == null && hasNextPage && currentPage <= 10)

            let subs = candies.filter((item: any) => item.lang == 'sub')
            let dubs = candies.filter((item: any) => item.lang == 'dub')

            for (let i = 0; i < subs.length; i++) {
                const d = await this.getGogoDetails(subs[i].id);
                console.log(d);
                if (this.matchDetails(d, data)) {
                    result.sub = subs[i].id
                    break
                }
            }

            if (result.sub != null) {
                result.dub = dubs.filter((item: any) => (result.sub + "-dub") == item.id).pop()?.id ?? null
                if (!result.dub) {
                    for (let i = 0; i < dubs.length; i++) {
                        const d = await this.getGogoDetails(dubs[i].id)
                        console.log(d)
                        if (this.matchDetails(d, data)) {
                            result.dub = dubs[i].id
                            break
                        }
                    }
                }
            }

            return result.sub == null && result.dub == null && narrowSearch ?
                this.mapAnilistToGogo(data, false) :
                result
        }
        catch (err) {
            if (err instanceof AxiosError) {
                console.log(err.response?.data)
            }
            else console.log(err)
            return null
        }
    }

    private static parseGogoSearchItem(item: cheerio.Cheerio): any {
        const result = {
            id: "",
            lang: "",
            year: 0,
            yearString: "",
        }

        result.id = item.find("p.name > a").attr("href")?.split("/").pop()!
        // result.title = item.find('p.name > a').attr('title')!
        result.lang = result.id.endsWith("dub") ? "dub" : "sub"
        result.yearString = item.find("p.released").text().trim().split(' ').pop()!
        result.year = parseInt(result.yearString)

        return result
    }

    static async getGogoDetails(id: string): Promise<any | null> {
        try {
            const result = {
                type: "" as string,
                status: "" as string | null,
                season: null as string | null
            }

            const response = await axios.get("https://gogoanime3.net/category/" + id)
            const $ = load(response.data)

            const type = $("div.anime_info_body_bg > p:nth-child(4) > a").text().trim().toUpperCase()
            switch (type) {
                case "MOVIE": {
                    result.type = "MOVIE"
                    break
                }
                case "SPECIAL": {
                    result.type = "SPECIAL"
                    break
                }
                case "OVA": {
                    result.type = "OVA"
                    break
                }
                case "ONA": {
                    result.type = "ONA"
                    break
                }
                default: {
                    const season = type.split(' ')[0]
                    if (season != "TV") {
                        result.season = season
                    }
                    result.type = "TV"
                    break
                }
            }
            switch ($('div.anime_info_body_bg > p:nth-child(8) > a').text().trim().toUpperCase()) {
                case "COMPLETED": {
                    result.status = "FINISHED"
                    break
                }
                case "ONGOING": {
                    result.status = "RELEASING"
                    break
                }
                case "UPCOMING": {
                    result.status = "NOT_YET_RELEASED0"
                }
                default: {
                    result.status = null
                }
            }

            return result
        }
        catch (err: any) {
            if (err instanceof AxiosError) console.log(err.response?.data)
            else console.log(err)
        }
        return null
    }

    private static matchDetails = (gogo: any, anilist: any): boolean =>
        gogo.type == anilist.format &&
        gogo.status == anilist.status &&
        (gogo.season == null || gogo.season == anilist.season)
}

function findCommonName(names: string[]): string {
    let name = ""
    let minRange = getMinLength(names)

    for (let i = 0; i < minRange; i++) {
        let char = names[0][i]
        let sameCount = 0
        for (let x = 0; x < names.length; x++) {
            if (names[x][i] !== char) sameCount--
            else sameCount++
        }
        if (sameCount > 0) name += char
        else break
    }

    return name.replace(/[^\w\s]/gi, ' ')
}

function getMinLength(values: string[]): number {
    let length = values[0].length
    for (let i = 1; i < values.length; i++) {
        length = Math.min(length, values[i].length)
    }
    return length
}