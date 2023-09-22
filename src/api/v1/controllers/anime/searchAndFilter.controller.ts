import express, { Request, Response, query } from "express";

import { MasterZoro } from "../../../../services/providers/anime/MasterZoro.js"
import { ZoroFilter } from "../../../../services/providers/anime/informers/ZoroSearch.js";
import { AnimeCategory, AnimeScoreIndex, AnimeSeasonIndex, AnimeSortIndex, AnimeStatusIndex, AnimeTypeIndex, AnimeVoiceTrackIndex } from "../../../../services/models/AnimeModels.js";
import { safeExecute } from "../../../utils/safeUtils.js";

function createFilter(filter: any): ZoroFilter {
    let filterVal = new ZoroFilter()

    if (filter.sort) {
        filterVal.sort =
            Object.entries(AnimeSortIndex).find(([_, val]) => val == filter.sort)?.[1] as AnimeSortIndex || filterVal.sort
    }

    if (filter.status) {
        filterVal.status =
            Object.entries(AnimeStatusIndex).find(([_, val]) => val == filter.status)?.[1] as AnimeStatusIndex || filterVal.status
    }

    if (filter.type) {
        filterVal.type =
            Object.entries(AnimeTypeIndex).find(([_, val]) => val == filter.type)?.[1] as AnimeTypeIndex || filterVal.type
    }

    if (filter.season) {
        filterVal.season =
            Object.entries(AnimeSeasonIndex).find(([_, val]) => val == filter.season)?.[1] as AnimeSeasonIndex || filterVal.season
    }

    if (filter.score) {
        filterVal.score =
            Object.entries(AnimeScoreIndex).find(([_, val]) => val == filter.score)?.[1] as AnimeScoreIndex || filterVal.score
    }

    if (filter.lang) {
        filterVal.language =
            Object.entries(AnimeVoiceTrackIndex).find(([_, val]) => val == filter.lang)?.[1] as AnimeVoiceTrackIndex || filterVal.language
    }

    // if (filter.genres) {
    //     filterVal.genres =
    //     Object.entries().find(([_, val]) => val == filter.sort)?.[1] as AnimeTypeIndex || filterVal.type
    // }

    return filterVal
}

export const search = async (req: Request, res: Response) => {
    let keyword = req.params.query
    if (keyword) {
        let query = createFilter(req.query)
        safeExecute(async () => {
            let page = req.query.page && typeof req.query.page == "string" ? parseInt(req.query.page) : 1
            let animePage = MasterZoro.search(keyword, query)
            let data = await animePage.setPage(page).next()
            res.json({ status: 200, page, total: data.length, lastPage: animePage.getLastPage(), data })
        }, res)
    }
    else {
        res.statusCode = 400
        res.statusMessage = "Invalid query parameter."
        res.json({
            status: 400,
            data: {},
            error: ["Invalid query parameter."]
        })
    }
}

export const filter = async (req: Request, res: Response) => {
    let query = createFilter(req.query)
    safeExecute(async () => {
        let page = req.query.page && typeof req.query.page == "string" ? parseInt(req.query.page) : 1
        let animePage = MasterZoro.filter(query)
        let data = await animePage.setPage(page).next()
        res.json({ status: 200, page, total: data.length, lastPage: animePage.getLastPage(), data })
    }, res)
}

export const searchByCatagory = async (req: Request, res: Response) => {
    let categoryString = req.params.category
    let category = 
        Object.entries(AnimeCategory).find(([_, val]) => val.toLowerCase() == categoryString.toLowerCase())
        ?.[1] as AnimeCategory
    if (category) {
        safeExecute(async () => {
            let page = req.query.page && typeof req.query.page == "string" ? parseInt(req.query.page) : 1
            let animePage = MasterZoro.getAnimeByCategory(category)
            let data = await animePage.setPage(page).next()
            res.json({ status: 200, page, total: data.length, lastPage: animePage.getLastPage(), data })
        }, res)
    }
    else {
        res.status(404).statusMessage = "Invalid category."
        res.send({
            status: 404,
            data: {},
            error: ["Invalid category, choose from 'top-airing | most-popular | most-favorited | completed | recently-updated'"]
        })
    }
}

export const searchByGenre = async (req: Request, res: Response) => {
    let genre = req.params.genre
    if (genre) {
        safeExecute(async () => {
            let page = req.query.page && typeof req.query.page == "string" ? parseInt(req.query.page) : 1
            let animePage = MasterZoro.getAnimeByGenre(genre)
            let data = await animePage.setPage(page).next()
            res.json({ status: 200, page, total: data.length, lastPage: animePage.getLastPage(), data })
        }, res)
    }
    else {
        res.status(404).statusMessage = "Invalid genre."
        res.send({
            status: 404,
            data: {},
            error: ["Invalid genre, choose from 'action | adventure | comedy | drama | fantasy | horror | mystery | romance | sci-fi | thriller | western'"]
        })
    }
}

export const getSpotlightAnime = async (req: Request, res: Response) => {
    safeExecute(async () => {
        let data = await MasterZoro.getSpotlightAnime()
        res.json({ status: 200, total: data.length, data })
    }, res)
} 