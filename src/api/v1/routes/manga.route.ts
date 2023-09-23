import { Router } from "express";

import controller from "../controllers/manga/index.js"

const mangaRoute = Router()
export default mangaRoute

mangaRoute.get('/search/:query', controller.search.search)

mangaRoute.get('/popular', controller.search.getPopularManga)

mangaRoute.get('/trending', controller.search.getTrendingManga)

mangaRoute.get('/latest', controller.search.getLatestManga)

mangaRoute.get('/erotic', controller.search.getEroticManga)

mangaRoute.get('/hentai', controller.search.getHentaiManga)

mangaRoute.get('/:mangaId', controller.details.getMangaInfo)

mangaRoute.get('/cover/:coverId', controller.details.getMangaCover)

mangaRoute.get('/:mangaId/chapters', controller.details.getChapters)

mangaRoute.get('/pages/:chapterId', controller.details.getChapterPages)