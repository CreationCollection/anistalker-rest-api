import express, { Request, Response, query } from "express";

import { MasterZoro } from "../../../../services/providers/anime/MasterZoro.js"
import { ZoroFilter } from "../../../../services/providers/anime/informers/ZoroSearch.js";
import { AnimeScoreIndex, AnimeSeasonIndex, AnimeSortIndex, AnimeStatusIndex, AnimeTypeIndex, AnimeVoiceTrackIndex } from "../../../../services/models/AnimeModels.js";
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
        safeExecute (async () => {
            let data = await MasterZoro.search(keyword, query).next()
            res.json({ status: 200, data })
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
    safeExecute (async () => {
        let data = await MasterZoro.filter(query).next()
        res.json({ status: 200, data })
    }, res)
}