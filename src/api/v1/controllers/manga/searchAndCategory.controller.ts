import MangaDex from '../../../../services/providers/manga/MangaServer.js'
import { safeExecute } from '../../../utils/safeUtils.js'

import { Request, Response } from 'express'

// /manga/search/:query
const search = async (req: Request, res: Response) => {
    let param = req.params.query
    let page = req.query.page && typeof req.query.page == "string" ? parseInt(req.query.page) : 1
    safeExecute(async () => {
        let result = MangaDex.search(param)
        let data = await result.get(page)
        res.json({ status: 200, page, total: data.length, lastPage: result.getLastPage(), data })
    }, res)
}

const getPopularManga = async (req: Request, res: Response) => {
    let page = req.query.page && typeof req.query.page == "string" ? parseInt(req.query.page) : 1
    safeExecute(async () => {
        let result = MangaDex.getPopularManga()
        let data = await result.get(page)
        res.json({ status: 200, page, total: data.length, lastPage: result.getLastPage(), data })
    }, res)
}

const getTrendingManga = async (req: Request, res: Response) => {
    let page = req.query.page && typeof req.query.page == "string" ? parseInt(req.query.page) : 1
    safeExecute(async () => {
        let result = MangaDex.getTrendingManga()
        let data = await result.get(page)
        res.json({ status: 200, page, total: data.length, lastPage: result.getLastPage(), data })
    }, res)
}

const getLatestManga = async (req: Request, res: Response) => {
    let page = req.query.page && typeof req.query.page == "string" ? parseInt(req.query.page) : 1
    safeExecute(async () => {
        let result = MangaDex.getLatestManga()
        let data = await result.get(page)
        res.json({ status: 200, page, total: data.length, lastPage: result.getLastPage(), data })
    }, res)
}

const getEroticManga = async (req: Request, res: Response) => {
    let page = req.query.page && typeof req.query.page == "string" ? parseInt(req.query.page) : 1
    safeExecute(async () => {
        let result = MangaDex.getEroticManga()
        let data = await result.get(page)
        res.json({ status: 200, page, total: data.length, lastPage: result.getLastPage(), data })
    }, res)
}

const getHentaiManga = async (req: Request, res: Response) => {
    let page = req.query.page && typeof req.query.page == "string" ? parseInt(req.query.page) : 1
    safeExecute(async () => {
        let result = MangaDex.getHentaiManga()
        let data = await result.get(page)
        res.json({ status: 200, page, total: data.length, lastPage: result.getLastPage(), data })
    }, res)
}

export default {
    search, getPopularManga, getTrendingManga, getLatestManga, getEroticManga, getHentaiManga
}