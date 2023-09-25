import { Response, Request } from "express";
import { Hentai } from '../../../../services/models/HentaiModels.js'
import hentai from '../../../../services/providers/hentai/Hanime.js'
import { safeExecute } from '../../../utils/safeUtils.js'

// /trending/:time?page
const getTrending = async (req: Request, res: Response) => {
    let page = req.query.page && typeof req.query.page == "number" ? parseInt(req.query.page) : 1
    if (['day', 'week', 'month'].includes(req.params.time)) {
        safeExecute(async () => {
            let data = await hentai.getTrending(req.params.time as 'day' | 'week' | 'month', page)
            res.json({ status: 200, data: data.videos, lastPage: data.lastPage })
        }, res)
    }
    else {
        res.json({
            status: 404,
            error: "Wrong time value, values are [day, week, month]",
            data: {}
        })
    }
}

const getRandom = async (req: Request, res: Response) => {
    safeExecute(async () => {
        let data = await hentai.getRandom()
        res.json({ status: 200, data })
    }, res)
}

const getTags = async (req: Request, res: Response) => {
    safeExecute(async () => {
        let data = await hentai.getTags()
        res.json({ status: 200, data })
    }, res)
}

const getVideoByCategory = async (req: Request, res: Response) => {
    let category = req.params.category
    let page = req.query.page && typeof req.query.page == "number" ? parseInt(req.query.page) : 1
    safeExecute(async () => {
        let data = await hentai.getVideoByCategory(category, page)
        res.json({ status: 200, data: data.videos, lastPage: data.lastPage })
    }, res)
}

const getVideo = async (req: Request, res: Response) => {
    let slug = req.params.slug
    let seperateFiles = req.query.sf == 'true'
    safeExecute(async () => {
        let data = await hentai.getVideo(slug, seperateFiles)
        res.json({ status: 200, data })
    }, res)
}

const search = async (req: Request, res: Response) => {
    let keyword = req.params.query
    let page = req.query.page && typeof req.query.page == "number" ? parseInt(req.query.page) : 1
    safeExecute(async () => {
        let data = await hentai.search(keyword, page)
        res.json({ status: 200, data: data.videos, lastPage: data.lastPage })
    }, res)
}

export default { search, getTrending, getRandom, getTags, getVideoByCategory, getVideo }