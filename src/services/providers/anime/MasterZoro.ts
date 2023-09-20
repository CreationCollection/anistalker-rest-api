import { AnimeCategory, AnimeEpisodeDetail, AnimeEpisodeServers, AnimeFull, AnimeSpotlight, IAnimePage, ZoroStreamData } from "../../models/AnimeModels.js";
import { ZoroInformer } from "./informers/ZoroInformer.js";
import { ZoroFilter, ZoroSearch } from "./informers/ZoroSearch.js";
import { ZoroSpotlight } from "./informers/ZoroSpotlight.js"
import { ZoroStream } from "./streamers/ZoroStream.js"

export class MasterZoro {
    static search(search: string, _filter?: ZoroFilter | null): IAnimePage { return ZoroSearch.search(search, _filter) }
    static filter(_filter: ZoroFilter): IAnimePage { return ZoroSearch.filter(_filter) }

    static getSpotlightAnime(): Promise<AnimeSpotlight[]> { return ZoroSpotlight.getSpotlightAnime() }
    static getAnimeByGenre(genre: string): IAnimePage { return ZoroSearch.getAnimeByGenre(genre) }
    static getAnimeByCategory(category: AnimeCategory): IAnimePage { return ZoroSearch.getAnimeByCategory(category) }

    static getAnimeInfo = async (id: number): Promise<AnimeFull> => ZoroInformer.extractAnimeInfo(id)

    static getEpisodes = async (animeId: number): Promise<AnimeEpisodeDetail[]> => ZoroStream.getEpisodes(animeId)
    static getEpisodeServers = async (episodeId: number): Promise<AnimeEpisodeServers> => ZoroStream.getServersForEpisode(episodeId)
    static getEpisodeVideo = async (episodeServerId: number): Promise<ZoroStreamData> => ZoroStream.getVideoData(episodeServerId)
}