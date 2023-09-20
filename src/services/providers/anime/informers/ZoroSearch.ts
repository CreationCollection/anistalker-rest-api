import axios, { AxiosResponse } from 'axios';
import { load } from 'cheerio';

import { IAnimePage, AnimePageState, Anime, AnimeSortIndex, AnimeTypeIndex, AnimeStatusIndex, AnimeScoreIndex, AnimeSeasonIndex, AnimeVoiceTrackIndex } from '../../../models/AnimeModels.js'
import { AniError, AniErrorCode } from '../../../../aniutils/AniError.js'
import { ZoroInformer } from './ZoroInformer.js';

export class ZoroFilter {
    keyword: string | null = null;
    sort: AnimeSortIndex = AnimeSortIndex.DEFAULT;
    type: AnimeTypeIndex = AnimeTypeIndex.ALL;
    status: AnimeStatusIndex = AnimeStatusIndex.ALL;
    score: AnimeScoreIndex = AnimeScoreIndex.ALL;
    season: AnimeSeasonIndex = AnimeSeasonIndex.ALL;
    language: AnimeVoiceTrackIndex = AnimeVoiceTrackIndex.ALL;
    genres: string[] | null= null;
}

export class ZoroSearch {
    static search(search: string, _filter?: ZoroFilter | null): IAnimePage {
        const searchFilter = _filter || new ZoroFilter()
        searchFilter.keyword = search;
        return this.filter(searchFilter);
    }

    static filter(_filter: ZoroFilter): IAnimePage {
        const type = `&type=${_filter.type}`;
        const status = `&status=${_filter.status}`;
        const score = `&score=${_filter.score}`;
        const season = `&season=${_filter.season}`;
        const language = `&language=${_filter.language}`;
        const genres = _filter.genres ? `&genres=${encodeURIComponent(_filter.genres.join(','))}` : '';
        const keyword = _filter.keyword ? `&keyword=${encodeURIComponent(_filter.keyword)}` : '';
        const page = _filter.keyword ? 'search' : 'filter';

        const pageUrl = `https://aniwatch.to/${page}?page=@page${keyword}${type}${status}${score}${season}${language}${genres}`;

        return this.getAnimePage(pageUrl);
    }

    static getAnimeByGenre(genre: string): IAnimePage {
        return this.getAnimePage(`https://aniwatch.to/genre/${genre}`);
    }

    static getAnimeByCategory(category: string): IAnimePage {
        return this.getAnimePage(`https://aniwatch.to/${category}`);
    }

    static getAnimePage(url: string): IAnimePage {
        return new AnimePage(url)
    }
}

export class AnimePage implements IAnimePage {
    private animeList: Anime[] = [];
    private stateListener: ((state: AnimePageState, value1: number, value2: number) => void) | null = null;
    private currentPage: number = 0;
    private lastPage: number = 0;

    constructor(private url: string) {
        this.url = url;
    }

    hasNextPage(): boolean {
        return this.currentPage < this.lastPage;
    }

    async next(): Promise<Anime[]> {
        return new Promise(async (resolve, reject) => {
            if (this.stateListener)
                this.stateListener(AnimePageState.LOADING, ++this.currentPage, this.lastPage);

            let pageUrl = this.url.replace("@page", this.currentPage.toString())
            let page: AxiosResponse = await axios.get(pageUrl, { responseType: 'text' })

            if (page.status == 404) {
                reject(AniError.buildWithMessage(AniErrorCode.NOT_FOUND, "Zoro Anime Page Not Found at $url"))
                return
            }
            else if (page.status / 100 != 2) {
                reject(AniError.build(AniErrorCode.UNKNOWN))
                return
            }

            let $ = load(page.data);
            let content = $('.film_list .film_list-wrap .flw-item').map((index, element) => {
                return ZoroInformer.extractSearchInfo(element)
            }).get();

            let pItem = $('.pre-pagination');
            if (pItem.length === 0) {
                this.lastPage = 1;
            } else {
                let link = pItem.find('.pagination .page-item').last().find('a').attr('href')
                if (link) {
                    let pageIndex = link.split('?').pop()
                                    ?.split('&')
                                    .find(x => x.includes('page'))
                                    ?.split('=').pop()
                    this.lastPage = pageIndex ? parseInt(pageIndex) : 1
                } else {
                    this.lastPage = 1;
                }
            }

            let offset = this.size()
            let length = content.length

            this.animeList.push(...content)
            if (this.stateListener)
                this.stateListener(AnimePageState.ADDED, offset, length);
            resolve(content)
        })
    }

    get(index: number): Anime {
        return this.animeList[index];
    }

    getAll(): Anime[] {
        return this.animeList;
    }

    size(): number {
        return this.animeList.length;
    }

    onStateChange(listener: (state: AnimePageState, value1: number, value2: number) => void) {
        this.stateListener = listener;
    }
}