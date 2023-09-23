import { IMangaPage, Manga, MangaChapter } from "../../models/MangaModels.js";
import { extractAggregateChapterData, extractChapterData, extractMangaData, extractPanelUrl } from "./MangaInformer.js"

import axios, { AxiosError, AxiosResponse } from "axios"

export default class MangaDex {
    static search(keyword: string): IMangaPage {
        let url = `https://api.mangadex.org/manga?title=${keyword}`
                    +`&availableTranslatedLanguage[]=en`
                    +`&contentRating[]=safe&contentRating[]=suggestive`
                    +`&contentRating[]=erotica&contentRating[]=pornographic`
                    +`&limit=20&offset=@offset`;
        return new MangaPage(url)
    }

    static getPopularManga(): IMangaPage {
        let url = 'https://api.mangadex.org/manga?limit=10&offset=@offset&order[followedCount]=desc&availableTranslatedLanguage[]=en'
        return new MangaPage(url)
    }

    static getTrendingManga(): IMangaPage {
        let url = 'https://api.mangadex.org/manga?limit=10&offset=@offset&order[year]=desc&order[followedCount]=desc&availableTranslatedLanguage[]=en'
        return new MangaPage(url)
    }

    static getLatestManga(): IMangaPage {
        let url = 'https://api.mangadex.org/manga?limit=10&offset=@offset&order[createdAt]=desc&availableTranslatedLanguage[]=en'
        return new MangaPage(url)
    }

    static getEroticManga(): IMangaPage {
        let url = 'https://api.mangadex.org/manga?limit=10&offset=@offset&order[followedCount]=desc&availableTranslatedLanguage[]=en&contentRating[]=erotica&contentRating[]=pornographic'
        return new MangaPage(url)
    }

    static getHentaiManga(): IMangaPage {
        let url = 'https://api.mangadex.org/manga?limit=10&offset=@offset&order[followedCount]=desc&availableTranslatedLanguage[]=en&contentRating[]=pornographic'
        return new MangaPage(url)
    }

    static async getMangaInfo(mangaId: string): Promise<Manga | null> {
        let url = `https://api.mangadex.org/manga/${mangaId}`
        let result: AxiosResponse = await axios.get(url)
        return extractMangaData(result.data.data)
    }

    static async getMangaCover(coverId: string): Promise<{ low: string, high: string }> {
        let url = `https://api.mangadex.org/cover/${coverId}`
        let result: AxiosResponse = await axios.get(url)
        let mangaId = result.data.data.relationships.find((r: any) => r.type == "manga")?.id
        let baseUrl = `https://uploads.mangadex.org/covers/${mangaId}/${ result.data.data.attributes.fileName }`
        return {
            low: baseUrl + ".256.jpg",
            high: baseUrl + '.512.jpg'
        }
    }

    static async getChapters(mangaId: string, page: number): 
            Promise<{ chapters:MangaChapter[], lastPage: number }> 
    {
        let url = `https://api.mangadex.org/manga/${mangaId}/feed?translatedLanguage[]=en&limit=20&offset=${page - 1}&order[chapter]=desc`
        let fallBackUrl = `https://api.mangadex.org/manga/${mangaId}/aggregate?translatedLanguage[]=en`
        let result: AxiosResponse = await axios.get(url)
        if (result.data.data.length == 0) {
            result = await axios.get(fallBackUrl)
            return { chapters: extractAggregateChapterData(result.data), lastPage: 1 }
        }

        let lastPage = Math.ceil(parseInt(result.data.total) / 20)
        return { chapters: extractChapterData(result.data.data), lastPage }
    }

    static async getChapterPages(chapterId: string): Promise<{ low: string[], high: string[]}> {
        let url = "https://api.mangadex.org/at-home/server/" + chapterId
        let result: AxiosResponse = await axios.get(url)
        return {
            low: extractPanelUrl(result.data, true),
            high: extractPanelUrl(result.data)
        }
    }
}

class MangaPage implements IMangaPage {
    private lastPage: number = 1

    constructor(private url: string) {
    }

    async get(page: number): Promise<Manga[]> {
        let url = this.url.replace("@offset", (page - 1).toString())
        let result: AxiosResponse = await axios.get(url)

        let content: Manga[] = []

        this.lastPage = Math.ceil(parseInt(result.data.total) / parseInt(result.data.limit))
        if (result.data?.data?.length > 0) {
            for (let item of result.data.data) {
                let manga = extractMangaData(item)
                if (manga) {
                    content.push(manga)
                }
            }
        }

        return content
    }
    getLastPage(): number {
        return this.lastPage
    }

}