import axios, { AxiosError, AxiosResponse } from 'axios';
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
    genres: string[] | null = null;
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
        return this.getAnimePage(`https://aniwatch.to/genre/${genre}?page=@page`);
    }

    static getAnimeByCategory(category: string): IAnimePage {
        return this.getAnimePage(`https://aniwatch.to/${category}?page=@page`);
    }

    static getAnimePage(url: string): IAnimePage {
        return new AnimePage(url)
    }
}

export class AnimePage implements IAnimePage {
    private animeList: Anime[] = [];
    private stateListener: ((state: AnimePageState, value1: number, value2: number) => void) | null = null;
    private currentPage: number = 1;
    private lastPage: number = 1;

    constructor(private url: string) {
        this.url = url;
    }

    hasNextPage(): boolean {
        return this.currentPage < this.lastPage;
    }

    async next(): Promise<Anime[]> {
        if (this.stateListener)
            this.stateListener(AnimePageState.LOADING, this.currentPage, this.lastPage);

        let pageUrl = this.url.replace("@page", this.currentPage.toString())
        let page: AxiosResponse | null = null

        try {
            page = await axios.get(pageUrl, { responseType: 'text' })
        }
        catch (err: any) {
            if (err instanceof AxiosError) {
                throw new Error(err.message)
            }
            else {
                throw new Error(err.message)
            }
        }

        if (page == null) throw new Error("Unknow Error, Page is null")
        if (page.status == 404) {
            throw AniError.buildWithMessage(AniErrorCode.NOT_FOUND, "Zoro Anime Page Not Found at $url")
        }
        else if (page.status / 100 != 2) {
            throw AniError.build(AniErrorCode.UNKNOWN)
        }


        this.currentPage++

        let $ = load(page.data);
        let content = $('.film_list .film_list-wrap .flw-item').map((index, element) => {
            return ZoroInformer.extractSearchInfo(element)
        }).get();

        let pItem = $('.pre-pagination');
        if (pItem.length === 0) {
            this.lastPage = 1;
        } else {
            let link = pItem.find('.pagination .page-item').last().find('a')
            let pageIndex = link.attr('href')?.split('?')?.pop()
                ?.split('&')
                ?.find(x => x.includes('page'))
                ?.split('=')?.pop()
            this.lastPage = parseInt(pageIndex ?? link.text() ?? '0')
        }

        let offset = this.size()
        let length = content.length

        this.animeList.push(...content)
        if (this.stateListener)
            this.stateListener(AnimePageState.ADDED, offset, length);

        return content
    }

    getLastPage(): number {
        return this.lastPage
    }

    setPage(page: number): IAnimePage {
        this.currentPage = page
        return this
    }

    get(): Anime[] {
        return this.animeList;
    }

    size(): number {
        return this.animeList.length;
    }

    onStateChange(listener: (state: AnimePageState, value1: number, value2: number) => void) {
        this.stateListener = listener;
    }
}