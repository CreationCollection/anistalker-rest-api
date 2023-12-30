import axios, { AxiosError, AxiosResponse } from 'axios';
import cheerio from 'cheerio';
import { Anime, AnimeFull, AnimeRelations, AnimeSeason, AnimeStatus, AnimeType, parseDuration } from '../../../models/AnimeModels.js';
import { AniError, AniErrorCode } from '../../../../aniutils/AniError.js';
import { data } from 'node_modules/cheerio/lib/api/attributes.js';
import { title } from 'process';

export class ZoroInformer {
    private static months: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    static extractSearchInfo(element: cheerio.Element): Anime {
        let anime: Anime = new Anime();
        let $ = cheerio.load(element)

        let filmPoster = $(".film-poster");
        anime.id.zoroId = filmPoster.find("a").attr("data-id") ?
            parseInt(filmPoster.find("a").attr("data-id")!) :
            0;
        anime.image = filmPoster.find("img").attr("data-src") || '';

        let rate = filmPoster.find(".tick.tick-rate");
        if (rate.length > 0) {
            anime.isAdult = true;
        }

        let tickItems = filmPoster.find(".tick.ltr .tick-item");
        tickItems.each((_, ep) => {
            let className = $(ep).attr('class') || '';
            if (className.includes("tick-sub")) {
                anime.episodes.sub = parseInt($(ep).text() || '0');
            } else if (className.includes("tick-dub")) {
                anime.episodes.dub = parseInt($(ep).text() || '0');
            } else if (className.includes("tick-eps")) {
                anime.episodes.total = parseInt($(ep).text() || '0');
            }
        });

        let filmDetail = $(".film-detail");
        let title = filmDetail.find(".film-name > a");
        if (title.length > 0) {
            anime.title.english = title.attr("title");
            anime.title.userPreferred = title.attr("data-jname");
        }

        let format = filmDetail.find(".fd-infor > .fdi-item").eq(0).text().toLowerCase();
        anime.type =
            Object.entries(AnimeType)
                .find(([_, value]) => value.toLowerCase() === format.toLowerCase())?.[1]
            || AnimeType.TV;

        let duration = filmDetail.find(".fd-infor > .fdi-item.fdi-duration").text();
        anime.duration = parseDuration(duration);

        return anime;
    }

    static async extractAnimeInfo(id: number, retry: number = 0): Promise<AnimeFull> {
        let anime: AnimeFull = new AnimeFull();
        if (retry == 1) console.log("Using Backup site...")

        try {
            let response: AxiosResponse | null = null;

            const baseUrl = retry == 0 ? "https://aniwatch.to" : "https://aniwatchtv.to"
            try {
                response = await axios.get(`${baseUrl}/anime-${id}`)
            } catch (err: any) {
                if (err.response.status == 404) {
                    throw AniError.buildWithMessage(AniErrorCode.NOT_FOUND, "Page not found");
                } else if (Math.floor(err.response.status / 100) !== 2) {
                    throw AniError.build(AniErrorCode.UNKNOWN);
                }
            }

            if (!response) return anime;

            let $ = cheerio.load(response.data);
            let content = $("#ani_detail .anis-content");

            if (content.length == 0 && retry == 0) return this.extractAnimeInfo(id, 1);
            else if (content.length == 0) throw new AniError(AniErrorCode.NOT_FOUND, "Unable to reach Zoro"); 

            anime.image = content.find(".anisc-poster > .film-poster > img").attr("src") || '';
            let rate = content.find(".anisc-poster > .film-poster > .tick-rate");
            if (rate.length > 0) {
                anime.isAdult = true;
            }

            let filmName = content.find(".anisc-detail > .film-name");
            anime.title.userPreferred = filmName.attr("data-jname");
            anime.title.english = filmName.text();

            let detail = content.find(".anisc-detail > .film-stats > .tick > .tick-item");
            detail.each((_, item) => {
                let className = $(item).attr('class') || '';
                if (className.includes("tick-sub")) {
                    anime.episodes.sub = parseInt($(item).text() || '0');
                } else if (className.includes("tick-dub")) {
                    anime.episodes.dub = parseInt($(item).text() || '0');
                } else if (className.includes("tick-eps")) {
                    anime.episodes.total = parseInt($(item).text() || '0');
                }
            });

            let item = content.find(".anisc-info-wrap > .anisc-info > .item");
            let offset = 0;
            anime.description = item.eq(offset++).children().eq(1).text() || '';
            offset++

            let synonyms = item.eq(offset);
            if (synonyms.children().eq(0).text().includes("Synonyms")) {
                offset++
                anime.otherNames =
                    synonyms.children().eq(1).text()
                        ?.split(",")
                        .map((x: string) => x.trim())
                        .filter((x: any) => x) || [];
            }

            let dates = item.eq(offset++).children().eq(1)
                .text()?.split("to")
                .map((x: string) => {
                    return x.trim().replace(",", "").split(" ").filter(y => y)
                }) || [];
            if (dates[0] && dates[0].length === 3) {
                anime.start.month = this.months.indexOf(dates[0][0]);
                anime.start.date = parseInt(dates[0][1]);
                anime.start.year = parseInt(dates[0][2]);
            }
            if (dates[1] && dates[1].length === 3) {
                anime.end.month = this.months.indexOf(dates[1][0]);
                anime.end.date = parseInt(dates[1][1]);
                anime.end.year = parseInt(dates[1][2]);
            }

            let season = item.eq(offset++).children().eq(1).text().split(" ")[0]
            anime.season =
                Object.entries(AnimeSeason).find(([_, val]) => val.toLowerCase() == season.toLowerCase())?.[1] || AnimeSeason.WINTER

            let duration = item.eq(offset++).children().eq(1).text()
            anime.duration = parseDuration(duration)

            let status = item.eq(offset++).children().eq(1).text()?.toLowerCase();
            anime.status =
                Object.entries(AnimeStatus).find(([_, val]) => val.toLowerCase() == status.toLowerCase())?.[1] || AnimeStatus.FINISHED

            anime.score = parseFloat(item.eq(offset++).children().eq(1).text() || '0');

            anime.genres = []
            item.eq(offset++).find('a')
                .each((_, x) => {
                    let text = $(x).text();
                    if (text.length > 0) {
                        anime.genres.push(text)
                    }
                })

            anime.relations = []
            $(".os-list > a").each((_, el) => {
                let zoroId = $(el).attr('href')?.split('-').pop()
                let title = $(el).children().eq(0).text();
                let image = $(el).children().eq(1).attr('style')
                    ?.split(";")
                    .map(x => x.trim())
                    .find(x => x.includes("background-image"))
                    ?.split("url(")[1].split(")")[0]

                let relation = new AnimeRelations()
                relation.zoroId = parseInt(zoroId || '0')
                relation.title = title
                relation.image = image

                anime.relations.push(relation)
            }).get();

            let syncData = $("#syncData").text();
            if (syncData) {
                let data = JSON.parse(syncData);
                anime.title.english = data.name;
                anime.id.zoroId = parseInt(data.anime_id || '0');
                anime.id.aniId = parseInt(data.anilist_id || '0');
                anime.id.malId = parseInt(data.mal_id || '0');
            }
        } catch (error) {
            if (error instanceof Error) {
                throw error.stack
            }
            else {
                console.log(error)
            }
        }

        return anime
    }

    static async verifyAnimeId(id: number): Promise<boolean> {
        if (id < 1) return false
        try {
            let response = await axios.get(`https://aniwatch.to/anime-${id}`)
            if (response.status == 200)
                return true
        } catch (error) {
        }
        return false
    }

    static async filterOutAnimeName(aniId: number): Promise<string | null> {
        try {
            const query = `
                query($id: Int = ${aniId}) {
                    Media(type: ANIME, id:$id) {
                        relations {
                            nodes {
                                title { english }
                            }
                        }
                    }
                }
            `
            const res = await axios.post("https://graphql.anilist.co", { query })
            const nodes = res.data.data.Media.relations.nodes

            let common = nodes[0].title.english?.toLowerCase()
            nodes.forEach((node: any) => {
                const name = node.title.english?.toLowerCase()
                if (name) {
                    if (common == null || common.length == 0) common = name
                    let result = ''
                    const minLen = Math.min(common.length, name.length)
                    for (let i = 0; i < minLen; i++) {
                        if (common[i] == name[i]) {
                            result += common[i]
                        }
                        else break
                    }
                    if (result.length > 0) common = result
                }
            });

            return common
        }
        catch (err: any) {
            if (err instanceof AxiosError) {
                console.log(err.response?.data)
            }
            else {
                console.log(err)
            }
        }

        return null
    }

    static async getImageList(malId: number): Promise<string[]> {
        let link = `https://api.jikan.moe/v4/anime/${malId}/pictures`
        let list: string[] = []

        try {
            let response: AxiosResponse | null = null;

            try {
                response = await axios.get(link)
            } catch (err: any) {
                if (err.response.status == 404) {
                    throw AniError.buildWithMessage(AniErrorCode.NOT_FOUND, "Page not found");
                } else if (Math.floor(err.response.status / 100) !== 2) {
                    throw AniError.build(AniErrorCode.UNKNOWN);
                }
            }

            if (!response) return list;

            let json = await response.data

            json.data.forEach((obj: any) => {
                list.push(obj.jpg.image_url)
            });
        } catch (error) {
            if (error instanceof Error) {
                throw error.stack
            }
            else {
                console.log(error)
            }
        }

        return list
    }
}