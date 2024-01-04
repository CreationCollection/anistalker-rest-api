import axios, { AxiosError } from "axios";

import { MasterZoro } from '../MasterZoro.js'
import { query } from "express";
import { AnilistInformer } from "./AnilistInformer.js";
import { GogoInformer } from "./GogoInformer.js";
import { AniError, AniErrorCode } from "../../../../aniutils/AniError.js";

export class ZoroMap {
    public zoroId: number = 0
    public anilistId: number = 0

    public gogoSub: { id: string | null, media: number | null } = { id: null, media: null }
    public gogoDub: { id: string | null, media: number | null } = { id: null, media: null }
}

export class ZoroMapper {
    private static readonly mappingDatabase = process.env.DATABASE_SERVER || 'http://localhost:5000/mapping'
    private static readonly apiKey = 1309192009

    private static mappingProcess = new Map()
    private static mappingDemands = new Map()

    static async mapZoro(zoroId: number): Promise<ZoroMap> {
        if (!this.mappingProcess.has(zoroId)) {
            this.mappingProcess.set(zoroId, new Promise(async (resolve, reject) => {
                const map: ZoroMap = new ZoroMap()
                map.zoroId = zoroId
                try {
                    if (!(await this.fetchMapping(zoroId, map)) && map.gogoDub.id == null) {
                        await this.findMapping(zoroId, map)
                        if (map.gogoSub.id != null) await this.saveMapping(zoroId, map)
                    }
                
                    resolve(map)
                } 
                catch (err: any) {
                    reject(err)
                }

            }))
        }

        this.incrementDemand(zoroId)
        const map = await this.mappingProcess.get(zoroId)
        this.decrementDemand(zoroId)
        return map
    }

    private static incrementDemand(zoroId: number) {
        this.mappingDemands.set(zoroId, (this.mappingDemands.get(zoroId) ?? 0) + 1)
    }

    private static decrementDemand(zoroId: number) {
        this.mappingDemands.set(zoroId, (this.mappingDemands.get(zoroId) ?? 0) - 1)
        if (this.mappingDemands.get(zoroId) == 0) setTimeout(() => {
            if (this.mappingDemands.get(zoroId) == 0) {
                this.mappingDemands.delete(zoroId)
                this.mappingProcess.delete(zoroId)
            }
        }, 20 * 1000)
    }

    private static async fetchMapping(zoroId: number, map: ZoroMap): Promise<boolean> {
        try {
            const res = await axios.get(`${this.mappingDatabase}/zoro/${zoroId}`, {
                headers: { 'Authorization': this.apiKey }
            })
            const data = res.data

            if (data.status != 0) return false

            map.gogoSub = data.data.gogoSub
            map.gogoDub = data.data.gogoDub

            console.log(`Mapping found in Database for zoroId: "${zoroId}"`, data.data)

            return true
        }
        catch (err: any) {
            console.log('problem to access database: ' + this.mappingDatabase)
            return false
        }
    }

    private static async saveMapping(zoroId: number, map: ZoroMap) {
        try {
            await axios.post(`${this.mappingDatabase}/entry`,
                {
                    zoroId: zoroId,
                    map: {
                        anilist: map.anilistId,
                        gogoSub: map.gogoSub,
                        gogoDub: map.gogoDub
                    }
                },
                {
                    headers: { 'Authorization': 'Bearer ' + this.apiKey, 'Content-Type': 'application/json' }
                }
            )
        } catch (err: any) {
            console.log('mapping is not saved!')
        }
    }

    private static async findMapping(zoroId: number, map: ZoroMap) {
        console.log(`Mapping zoroId: "${zoroId}" to gogoId...`)

        const anime = await MasterZoro.getAnimeInfo(zoroId)
        console.log(anime.id)
        map.anilistId = anime.id.aniId || anime.id.malId

        const anilistInfo = await AnilistInformer.getAnilistInfo(map.anilistId, anime.id.aniId == 0)
        const gogoId = await GogoInformer.mapAnilistToGogo(anilistInfo)

        map.gogoSub = gogoId.sub ? gogoId.sub : map.gogoSub
        map.gogoDub = gogoId.dub ? gogoId.dub : map.gogoDub

        if (gogoId.sub.id == null) {
            console.log(`Unable to map ZoroId: ${zoroId} to GogoAnimeId. No Match Found!`)
            throw new AniError(AniErrorCode.NOT_FOUND, "No Mapping Found!")
        }
        console.log(`Found GogoId for zoroId: ${zoroId}`, gogoId)
    }
}