import MangaDex from '../../../../services/providers/manga/MangaServer.js'
import { safeExecute } from '../../../utils/safeUtils.js'

import { Request, Response } from 'express'

const getMangaInfo = async (req: Request, res: Response) => {
    let mangaId = req.params.mangaId
    let data = await MangaDex.getMangaInfo(mangaId)
    res.json({ status: 200, data: data ?? {  } })
}

const getMangaCover = async (req: Request, res: Response) => {
    let coverId = req.params.coverId
    let data = await MangaDex.getMangaCover(coverId)
    res.json({ status: 200, data })
}

const getChapters = async (req: Request, res: Response) => {
    let mangaId = req.params.mangaId
    let page = req.query.page && typeof req.query.page == "string" ? parseInt(req.query.page) : 1
    let data = await MangaDex.getChapters(mangaId, page)
    res.json({ status: 200, data })
}

const getChapterPages = async (req: Request, res: Response) => {
    let chapterId = req.params.chapterId
    let data = await MangaDex.getChapterPages(chapterId)
    res.json({ status: 200, data })
}

export default { getMangaInfo, getMangaCover, getChapters, getChapterPages }