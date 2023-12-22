import { search, filter, searchByCatagory, searchByGenre, getSpotlightAnime, getTrendingAnime } from "./searchAndFilter.controller.js";
import { animeInfo, animeImages, animeEpisodes, animeEpisodeServers, animeEpisodeVideo, animeVideo } from "./animeDetail.controller.js"

export default {
    search, filter, searchByCatagory, searchByGenre, getSpotlightAnime, animeInfo, animeImages, animeEpisodeServers, animeEpisodeVideo, animeEpisodes, animeVideo, getTrendingAnime
}