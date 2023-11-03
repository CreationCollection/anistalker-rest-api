import express, { Request, Response, query } from "express";

import { MasterZoro } from "../../../../services/providers/anime/MasterZoro.js"
import { safeExecute } from "../../../utils/safeUtils.js";
import { AnimeServer, ZoroServers } from "../../../../services/models/AnimeModels.js";
import axios from "axios";

const IllAnimeIdMsg = "Invalid anime Id, id should be an interger"
const IllEpisodeIdMsg = "Invalid episode Id, id should be an interger"

const isIdValid = (id: string): boolean => /\d/.test(id)
const checkId = (id: string, res: Response, IllMsg: string): boolean => {
    let invalidMsg = IllMsg
    if (isIdValid(id)) {
        return true
    }
    else {
        res.statusCode = 400
        res.statusMessage = invalidMsg
        res.json({
            status: 400,
            error: [invalidMsg],
            data: {}
        })
        return false
    }
}

export const animeInfo = async (req: Request, res: Response) => {
    let animeId = req.params.animeId
    if (checkId(animeId, res, IllAnimeIdMsg)) {
        safeExecute(async () => {
            let data = await MasterZoro.getAnimeInfo(parseInt(animeId))
            res.json({ status: 200, data })
        }, res)
    }
}

// anime/images/:malId
export const animeImages = async (req: Request, res: Response) => {
    let malId = req.params.malId
    if (checkId(malId, res, IllAnimeIdMsg)) {
        safeExecute(async () => {
            let data = await MasterZoro.getAnimeImages(parseInt(malId))
            res.json({ status: 200, data })
        }, res)
    }
}

export const animeEpisodes = async (req: Request, res: Response) => {
    let animeId = req.params.animeId
    if (checkId(animeId, res, IllEpisodeIdMsg)) {
        safeExecute(async () => {
            let data = await MasterZoro.getEpisodes(parseInt(animeId))
            res.json({ status: 200, data })
        }, res)
    }
}

export const animeEpisodeServers = async (req: Request, res: Response) => {
    let epId = req.params.epId
    if (checkId(epId, res, IllEpisodeIdMsg)) {
        safeExecute(async () => {
            let data = await MasterZoro.getEpisodeServers(parseInt(epId))
            res.json({ status: 200, data })
        }, res)
    }
}

// /episode/:epId/video?server&track&seperatedFiles=true
export const animeEpisodeVideo = async (req: Request, res: Response) => {
    let epId = req.params.epId
    if (checkId(epId, res, IllEpisodeIdMsg)) {
        safeExecute(async () => {

            let seperatedFiles = typeof req.query.sf == 'string' && req.query.sf == 'true'
            let servers = await MasterZoro.getEpisodeServers(parseInt(epId))
            let server = req.query.track && req.query.track.toString() == 'dub' ? servers.dub : servers.sub
            let qServer = req.query.server?.toString()
            let sIndex = qServer ?
                server.findIndex((val, _) => val.server?.toLowerCase() == qServer) : 0

            if (server.length > 0 && sIndex >= 0 && sIndex < server.length) {
                let data = await MasterZoro.getEpisodeVideo(server[sIndex].serverId, seperatedFiles)
                res.json({
                    status: 200, data: {
                        server: { title: server[sIndex].server, id: server[sIndex].serverId },
                        track: server == servers.dub ? "dub" : "sub",
                        video: data.video,
                        subtitles: data.subtitles,
                        intro: { start: data.introStart, end: data.introEnd },
                        outro: { start: data.outroStart, end: data.outroEnd }
                    }
                })
            }
            else {
                if (server.length > 0) {
                    res.statusCode = 400
                    res.statusMessage = "Wrong Server Specified, choose some other one."
                    res.json({
                        status: 400,
                        data: {},
                        error: ["wrong server specified, choose some other one. Maybe call '/anime/episode/:episodeId/servers' before specified server, default is anyone comes first within specified track."]
                    })
                }
                else {
                    res.statusCode = 404
                    res.statusMessage = "No server for source"
                    res.json({
                        status: 404,
                        data: {},
                        error: ["No server available for this media, Before try to access media try calling '/anime/episode/:episodeId/servers' to check the availablity of servers"]
                    })
                }
            }
        }, res)
    }
}